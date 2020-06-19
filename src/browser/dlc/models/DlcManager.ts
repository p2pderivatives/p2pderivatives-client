import { Mutex } from 'await-semaphore'
import { DateTime } from 'luxon'
import { Logger } from 'winston'
import { Contract } from '../../../common/models/dlc/Contract'
import { OracleInfo } from '../../../common/models/dlc/OracleInfo'
import { Outcome } from '../../../common/models/dlc/Outcome'
import { isSuccessful } from '../../../common/utils/failable'
import BitcoinDClient from '../../api/bitcoind'
import { DlcMessageServiceApi } from '../../api/grpc/DlcMessageService'
import { OracleClientApi } from '../../api/oracle/oracleClient'
import { DlcBrowserAPI } from '../../ipc/DlcBrowserAPI'
import { DlcService } from '../service/DlcService'
import {
  AcceptedContract,
  AnyContract,
  MaturedContract,
  MutualCloseProposedContract,
  OfferedContract,
  RejectedContract,
  SignedContract,
  toAcceptMessage,
  toMutualClosingMessage,
  toOfferMessage,
} from './contract'
import { DlcError, DlcEventHandler } from './DlcEventHandler'
import {
  AcceptMessage,
  DlcAbstractMessage,
  DlcMessageType,
  MutualClosingMessage,
  OfferMessage,
  RejectMessage,
  SignMessage,
} from './messages'

export class DlcManager {
  private readonly timeoutHandle: NodeJS.Timeout
  private readonly mutex: Mutex

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
    this.dlcMessageService
      .getDlcMessageStream()
      .on('data', data => {
        this.onDlcMessage(data as DlcAbstractMessage)
      })
      .on('error', error => logger.error('Error', { error }))
    this.timeoutHandle = setInterval(
      () => this.periodicChecks(),
      timeOutSeconds * 1000
    )

    this.mutex = new Mutex()
  }

  finalize() {
    this.timeoutHandle.unref()
  }

  async sendContractOffer(contract: Contract): Promise<OfferedContract> {
    let contractId = ''
    try {
      const maturityTime = DateTime.fromMillis(contract.maturityTime, {
        zone: 'utc',
      })
      const result = await this.oracleClient.getRvalue('btcusd', maturityTime)
      if (!isSuccessful(result)) {
        throw new DlcError(`Could not get rValue: ${result.error.message}`)
      }
      const result2 = await this.oracleClient.getOraclePublicKey()
      if (!isSuccessful(result2)) {
        throw new DlcError(`Could not get public key: ${result2.error.message}`)
      }
      const values = result.value
      const oracleInfo: OracleInfo = {
        name: 'super oracle',
        publicKey: result2.value,
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
      })
      if (contractId) {
        const failedContract = await this.eventHandler.onSendOfferFail(
          contractId
        )
        throw new DlcError('Error offering contract', failedContract)
      }
      throw error
    }
  }

  async acceptContractOffer(contractId: string): Promise<AcceptedContract> {
    try {
      const acceptContract = await this.eventHandler.onOfferAccepted(contractId)
      const acceptMessage = toAcceptMessage(acceptContract)
      this.dlcMessageService.sendDlcMessage(
        acceptMessage,
        acceptContract.counterPartyName
      )
      return acceptContract
    } catch (error) {
      this.logger.error(`Error accepting contract ${contractId}: ${error}`)
      throw error
    }
  }

  async rejectContractOffer(contractId: string): Promise<RejectedContract> {
    try {
      const rejectedContract = await this.eventHandler.onRejectContract(
        contractId
      )
      return rejectedContract
    } catch (error) {
      this.logger.error(`Error rejecting contract ${contractId}: ${error}`)
      throw error
    }
  }

  private async periodicChecks() {
    const release = await this.mutex.acquire()
    try {
      await this.checkForConfirmedThatMaturedContracts()
      await this.checkForSignedOrBroadcastThatConfirmedContracts()
      await this.checkForMutualCloseProposedContracts()
      await this.checkForRefundableContracts()
    } catch (error) {
      this.logger.error(error)
    } finally {
      release()
    }
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

  private async checkForConfirmedThatMaturedContracts() {
    const matureContracts = (await this.dlcService.getConfirmedContractsToMature()) as MaturedContract[]
    for (const contract of matureContracts) {
      try {
        const result = await this.oracleClient.getSignature(
          contract.oracleInfo.assetId,
          DateTime.fromMillis(contract.maturityTime, { zone: 'utc' })
        )

        if (isSuccessful(result)) {
          const value = result.value
          const outcome = contract.outcomes.find(x => x.message == value.value)
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

  private async checkForSignedOrBroadcastThatConfirmedContracts() {
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

  private async checkForMutualCloseProposedContracts() {
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

  private async checkForRefundableContracts() {
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

  private async onDlcMessage(abstractMessage: DlcAbstractMessage) {
    const release = await this.mutex.acquire()
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
    } finally {
      release()
    }
  }

  private async handleAcceptMessage(
    from: string,
    acceptMessage: AcceptMessage
  ) {
    const { contract, message } = await this.eventHandler.onAcceptMessage(
      from,
      acceptMessage
    )
    this.dlcMessageService.sendDlcMessage(message, from)
    await this.ipcClient.dlcUpdate(contract)
  }

  private async handleMutualCloseOffer(
    from: string,
    message: MutualClosingMessage
  ) {
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

  private async handleOffer(from: string, message: OfferMessage) {
    const offerContract = await this.eventHandler.onOfferMessage(message, from)

    await this.ipcClient.dlcUpdate(offerContract)
  }

  private async handleSign(from: string, message: SignMessage) {
    const broadcastContract = await this.eventHandler.onSignMessage(
      from,
      message
    )

    await this.ipcClient.dlcUpdate(broadcastContract)
  }

  private async handleReject(from: string, message: RejectMessage) {
    const rejectedContract = await this.eventHandler.onContractRejected(
      message.contractId,
      from
    )

    await this.ipcClient.dlcUpdate(rejectedContract)
  }
}
