import { Mutex } from 'await-semaphore'
import { DateTime } from 'luxon'
import { Logger } from 'winston'
import { Contract } from '../../../common/models/dlc/Contract'
import { OracleInfo } from '../../../common/models/dlc/OracleInfo'
import { Outcome } from '../../../common/models/dlc/Outcome'
import { isSuccessful } from '../../../common/utils/failable'
import BitcoinDClient from '../../api/bitcoind'
import {
  DlcMessageServiceApi,
  DlcMessageStream,
} from '../../api/grpc/DlcMessageService'
import { OracleClientApi } from '../../api/oracle/oracleClient'
import { DlcBrowserAPI } from '../../ipc/DlcBrowserAPI'
import { DlcService } from '../service/DlcService'
import {
  AcceptedContract,
  AnyContract,
  MutualCloseProposedContract,
  OfferedContract,
  RejectedContract,
  SignedContract,
  toAcceptMessage,
  toMutualClosingMessage,
  toOfferMessage,
  toSignMessage,
} from '../models/contract'
import { DlcError, DlcEventHandler } from '../utils/DlcEventHandler'
import {
  AcceptMessage,
  DlcAbstractMessage,
  DlcMessageType,
  MutualClosingMessage,
  OfferMessage,
  RejectMessage,
  SignMessage,
} from '../models/messages'

export class DlcManager {
  private readonly timeoutHandle: NodeJS.Timeout
  private readonly mutex: Mutex
  private dlcMessageStream: DlcMessageStream
  private isFinalized = false

  constructor(
    private readonly eventHandler: DlcEventHandler,
    private readonly dlcService: DlcService,
    private readonly bitcoindClient: BitcoinDClient,
    private readonly ipcClient: DlcBrowserAPI,
    private readonly oracleClient: OracleClientApi,
    private readonly dlcMessageService: DlcMessageServiceApi,
    private readonly logger: Logger,
    timeOutSeconds: number
  ) {
    this.dlcMessageStream = this.dlcMessageService.getDlcMessageStream()
    this.timeoutHandle = setInterval(
      () => this.periodicChecks(),
      timeOutSeconds * 1000
    )

    this.handleStream()

    this.mutex = new Mutex()
  }

  finalize(): void {
    this.timeoutHandle.unref()
    this.dlcMessageStream.cancel()
    this.isFinalized = true
  }

  async handleStream(): Promise<void> {
    while (!this.isFinalized) {
      try {
        for await (const message of this.dlcMessageStream.listen()) {
          this.onDlcMessage(message)
        }
      } catch (error) {
        this.logger.error('Stream stopped with error', { error })
        if (!this.isFinalized) {
          // TODO(tibo): Better handling. If this throws, server might be
          // unreachable, need to propagate error to user.
          this.dlcMessageStream = this.dlcMessageService.getDlcMessageStream()
        }
      }
    }
  }

  async sendContractOffer(contract: Contract): Promise<OfferedContract> {
    return this.executeSafe(async () => {
      let contractId = ''
      try {
        const maturityTime = DateTime.fromMillis(contract.maturityTime, {
          zone: 'utc',
        })
        const result = await this.oracleClient.getRvalue('btcusd', maturityTime)
        if (!isSuccessful(result)) {
          throw new DlcError(`Could not get rValue: ${result.error.message}`)
        }
        const values = result.value
        const oracleInfo: OracleInfo = {
          name: 'super oracle',
          publicKey: values.oraclePublicKey,
          rValue: values.rvalue,
          assetId: values.assetID,
        }
        const offeredContract = await this.eventHandler.onSendOffer({
          ...contract,
          oracleInfo,
        })
        contractId = offeredContract.id
        const offerMessage = toOfferMessage(offeredContract)
        await this.dlcMessageService.sendDlcMessage(
          offerMessage,
          contract.counterPartyName
        )

        return offeredContract
      } catch (error) {
        this.logger.error(`Could not offer contract ${contract.id}: `, {
          error: error,
          message: error.message,
        })
        if (contractId) {
          const failedContract = await this.eventHandler.onSendOfferFail(
            contractId
          )
          throw new DlcError('Error offering contract', failedContract)
        }
        throw error
      }
    })
  }

  async acceptContractOffer(contractId: string): Promise<AcceptedContract> {
    return this.executeSafe(async () => {
      try {
        const acceptContract = await this.eventHandler.onOfferAccepted(
          contractId
        )
        const acceptMessage = toAcceptMessage(acceptContract)
        await this.dlcMessageService.sendDlcMessage(
          acceptMessage,
          acceptContract.counterPartyName
        )
        return acceptContract
      } catch (error) {
        this.logger.error(`Error accepting contract ${contractId}`, {
          message: error.message,
          error: error,
        })
        throw error
      }
    })
  }

  async rejectContractOffer(contractId: string): Promise<RejectedContract> {
    return this.executeSafe(async () => {
      try {
        const rejectedContract = await this.eventHandler.onRejectContract(
          contractId
        )
        const rejectMessage: RejectMessage = {
          messageType: DlcMessageType.Reject,
          contractId: rejectedContract.id,
        }
        await this.dlcMessageService.sendDlcMessage(
          rejectMessage,
          rejectedContract.counterPartyName
        )
        return rejectedContract
      } catch (error) {
        this.logger.error(`Error rejecting contract ${contractId}`, {
          message: error.message,
          error: error,
        })
        throw error
      }
    })
  }

  private async periodicChecks(): Promise<void> {
    await this.executeSafe(async () => {
      try {
        await this.checkForConfirmedThatMaturedContracts()
        await this.checkForSignedOrBroadcastThatConfirmedContracts()
        await this.checkForMutualCloseProposedContracts()
        await this.checkForRefundableContracts()
      } catch (error) {
        this.logger.error(error)
      }
    })
  }

  private async getTxConfirmations(txId: string): Promise<number> {
    try {
      const transaction = await this.bitcoindClient.getTransaction(txId)

      return transaction.confirmations
    } catch (err) {
      //TODO(tibo check that the error is about the tx)
      return -1
    }
  }

  private async trySendMutualCloseOffer(
    contract: AnyContract,
    outcome: Outcome
  ): Promise<boolean> {
    const mutualCloseProposeContract = await this.eventHandler.onSendMutualCloseOffer(
      contract.id,
      outcome
    )
    const mutualCloseMessage = toMutualClosingMessage(
      mutualCloseProposeContract
    )
    await this.ipcClient.dlcUpdate(mutualCloseProposeContract)

    try {
      await this.dlcMessageService.sendDlcMessage(
        mutualCloseMessage,
        contract.counterPartyName
      )
      return true
    } catch {
      return false
    }
  }

  private async checkForConfirmedThatMaturedContracts(): Promise<void> {
    const confirmedContracts = await this.dlcService.getConfirmedContractsToMature()
    for (const contract of confirmedContracts) {
      try {
        const result = await this.oracleClient.getSignature(
          contract.oracleInfo.assetId,
          DateTime.fromMillis(contract.maturityTime, { zone: 'utc' })
        )

        if (isSuccessful(result)) {
          const value = result.value
          const outcome = contract.outcomes.find(x => x.message === value.value)
          if (!outcome) {
            this.logger.error('Contract outcome not in the outcome list.')
            // Not much to do, contract will need to be closed with refund
            continue
          }
          const maturedContract = await this.eventHandler.onContractMature(
            contract.id,
            value.value,
            value.signature
          )
          await this.ipcClient.dlcUpdate(maturedContract)
          const offered = await this.trySendMutualCloseOffer(contract, outcome)
          if (!offered) {
            const unilateralClosed = await this.eventHandler.onUnilateralClose(
              contract.id
            )
            await this.ipcClient.dlcUpdate(unilateralClosed)
          }
        }
      } catch (error) {
        this.logger.error(
          `Error processing confirmed contract ${contract.id}: ${error}`
        )
      }
    }
  }

  private async checkForSignedOrBroadcastThatConfirmedContracts(): Promise<
    void
  > {
    const contracts = (await this.dlcService.getSignedAndBroadcastContracts()) as SignedContract[]

    for (const contract of contracts) {
      try {
        // TODO(tibo): set confirmation number as configuration parameter
        if ((await this.getTxConfirmations(contract.fundTxId)) >= 6) {
          const confirmedContract = await this.eventHandler.onContractConfirmed(
            contract.id
          )
          // TODO(tibo): refactor ipc call to remove eventtype
          await this.ipcClient.dlcUpdate(confirmedContract)
        }
      } catch (error) {
        this.logger.error(
          `Error processing signed contract ${contract.id}: ${error}`
        )
      }
    }
  }

  private async checkForMutualCloseProposedContracts(): Promise<void> {
    const contracts = (await this.dlcService.getMutualCloseOfferedContracts()) as MutualCloseProposedContract[]
    const utcNow = DateTime.utc()

    for (const contract of contracts) {
      try {
        const confirmations = await this.getTxConfirmations(
          contract.mutualCloseTxId
        )
        if (
          confirmations < 0 &&
          DateTime.fromMillis(contract.proposeTimeOut) <= utcNow
        ) {
          // TODO(tibo): Should move to intermediary state and later verify
          // that cet and closeTx are confirmed.
          const closedContract = await this.eventHandler.onUnilateralClose(
            contract.id
          )
          await this.ipcClient.dlcUpdate(closedContract)
        } else if (confirmations >= 0) {
          // TOD(tibo): Should have an intermediary to distinguished between
          // mutual close broadcast and confirmed.
          const mutualClosedContract = await this.eventHandler.onMutualCloseConfirmed(
            contract.id
          )
          await this.ipcClient.dlcUpdate(mutualClosedContract)
        }
      } catch (error) {
        this.logger.error(
          `Error processing mutual proposed contract ${contract.id}: ${error}`
        )
      }
    }
  }

  private async checkForRefundableContracts(): Promise<void> {
    const contracts = await this.dlcService.getRefundableContracts()

    for (const contract of contracts) {
      try {
        await this.eventHandler.onContractRefund(contract.id)
      } catch (error) {
        this.logger.error(
          `Error processing refund for contract ${contract.id}: ${error}`
        )
      }
    }
  }

  private async onDlcMessage(
    abstractMessage: DlcAbstractMessage
  ): Promise<void> {
    await this.executeSafe(async () => {
      try {
        const message = abstractMessage.payload
        const from = abstractMessage.from
        switch (message.messageType) {
          case DlcMessageType.Accept:
            await this.handleAcceptMessage(from, message as AcceptMessage)
            break
          case DlcMessageType.MutualCloseOffer:
            await this.handleMutualCloseOffer(
              from,
              message as MutualClosingMessage
            )
            break
          case DlcMessageType.Offer:
            await this.handleOffer(from, message as OfferMessage)
            break
          case DlcMessageType.Reject:
            await this.handleReject(from, message as RejectMessage)
            break
          case DlcMessageType.Sign:
            await this.handleSign(from, message as SignMessage)
            break
        }
      } catch (error) {
        this.logger.error(
          `Error processing message from ${abstractMessage.from}: ${error}`
        )
      }
    })
  }

  private async handleAcceptMessage(
    from: string,
    acceptMessage: AcceptMessage
  ): Promise<void> {
    const contract = await this.eventHandler.onAcceptMessage(
      from,
      acceptMessage
    )
    const message = toSignMessage(contract)
    this.dlcMessageService.sendDlcMessage(message, from)
    await this.ipcClient.dlcUpdate(contract)
  }

  private async handleMutualCloseOffer(
    from: string,
    message: MutualClosingMessage
  ): Promise<void> {
    const mutualClosedContract = await this.eventHandler.onMutualCloseOffer(
      from,
      message,
      async (assetId: string, maturityTime: DateTime) => {
        const result = await this.oracleClient.getSignature(
          assetId,
          maturityTime
        )
        if (isSuccessful(result)) {
          return {
            value: result.value.value,
            signature: result.value.signature,
          }
        }

        throw result.error
      }
    )

    await this.ipcClient.dlcUpdate(mutualClosedContract)
  }

  private async handleOffer(
    from: string,
    message: OfferMessage
  ): Promise<void> {
    const offerContract = await this.eventHandler.onOfferMessage(message, from)

    await this.ipcClient.dlcUpdate(offerContract)
  }

  private async handleSign(from: string, message: SignMessage): Promise<void> {
    const broadcastContract = await this.eventHandler.onSignMessage(
      from,
      message
    )

    await this.ipcClient.dlcUpdate(broadcastContract)
  }

  private async handleReject(
    from: string,
    message: RejectMessage
  ): Promise<void> {
    const rejectedContract = await this.eventHandler.onContractRejected(
      message.contractId,
      from
    )

    await this.ipcClient.dlcUpdate(rejectedContract)
  }

  private async executeSafe<T>(func: () => Promise<T>): Promise<T> {
    const release = await this.mutex.acquire()
    try {
      return await func()
    } finally {
      release()
    }
  }
}
