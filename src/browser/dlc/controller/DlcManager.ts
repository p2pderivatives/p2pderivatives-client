import { Mutex } from 'await-semaphore'
import { DateTime } from 'luxon'
import { Logger } from 'winston'
import { Contract } from '../../../common/models/dlc/Contract'
import { isSuccessful } from '../../../common/utils/failable'
import BitcoinDClient from '../../api/bitcoind'
import {
  DlcMessageServiceApi,
  DlcMessageStream,
} from '../../api/grpc/DlcMessageService'
import { OracleClientApi } from '../../api/oracle/oracleClient'
import { DlcBrowserAPI } from '../../ipc/DlcBrowserAPI'
import {
  AcceptedContract,
  ConfirmedContract,
  MaturedContract,
  OfferedContract,
  RejectedContract,
  SignedContract,
  toAcceptMessage,
  toOfferMessage,
  toSignMessage,
} from '../models/contract'
import {
  AcceptMessage,
  DlcAbstractMessage,
  DlcMessageType,
  OfferMessage,
  RejectMessage,
  SignMessage,
} from '../models/messages'
import { DlcService } from '../service/DlcService'
import * as Utils from '../utils/CfdUtils'
import { DlcError, DlcEventHandler } from '../utils/DlcEventHandler'

const MaxDelayMs = 5000

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
    this.timeoutHandle = setInterval(
      () => this.periodicChecks(),
      timeOutSeconds * 1000
    )

    this.mutex = new Mutex()
    this.dlcMessageStream = this.dlcMessageService.getDlcMessageStream()
    this.listenToStream()
  }

  finalize(): void {
    this.timeoutHandle.unref()
    this.isFinalized = true
    this.dlcMessageStream.cancel()
  }

  private sleep(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  private async listenToStream(): Promise<void> {
    let delay = 20
    while (!this.isFinalized) {
      try {
        for await (const message of this.dlcMessageStream.listen()) {
          delay = 20
          this.onDlcMessage(message)
        }
      } catch (error) {
        // TODO(tibo): should check if refresh token is still valid, if not,
        // need to redirect to login screen.
        this.logger.error('Stream stopped with error', { error })
        let isConnected = false
        while (!isConnected) {
          this.logger.info('Retrying in ' + delay + 'ms')
          await this.sleep(delay)
          delay = Math.min(MaxDelayMs, delay * 2)
          try {
            this.dlcMessageService.refreshAuth()
            this.dlcMessageStream = this.dlcMessageService.getDlcMessageStream()
            isConnected = true
          } catch {
            this.logger.error('Could not get dlc message stream.')
          }
        }
      }
    }
  }

  async sendContractOffer(contract: Contract): Promise<OfferedContract> {
    return this.executeSafe(async () => {
      let contractId = undefined
      try {
        const maturityTime = DateTime.fromMillis(contract.maturityTime, {
          zone: 'utc',
        })
        const result = await this.oracleClient.getAnnouncement(
          'btcusd',
          maturityTime
        )
        if (!isSuccessful(result)) {
          throw new DlcError(`Could not get rValue: ${result.error.message}`)
        }
        const initialContract = await this.eventHandler.onInitialize(
          {
            ...contract,
            oracleInfo: { name: 'not used', uri: 'not used' },
          },
          result.value
        )
        contractId = initialContract.id
        const offeredContract = await this.eventHandler.onSendOffer(
          initialContract
        )
        const offerMessage = toOfferMessage(offeredContract)
        await this.dlcMessageService.sendDlcMessage(
          offerMessage,
          contract.counterPartyName
        )

        return offeredContract
      } catch (error) {
        this.logger.error(`Could not offer contract ${contractId}: `, {
          error: error,
          message: error.message,
        })
        if (contractId) {
          const failedContract = await this.eventHandler.onSendOfferFail(
            contractId,
            error.message
          )
          throw new DlcError(
            `Error offering contract: ${error.message ||
              error._message ||
              'unknown error'}`,
            failedContract
          )
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
        try {
          await this.dlcMessageService.sendDlcMessage(
            acceptMessage,
            acceptContract.counterPartyName
          )
          return acceptContract
        } catch (e) {
          const offeredContract = await this.eventHandler.onOfferAcceptFailed(
            contractId
          )
          throw new DlcError(e._message, offeredContract)
        }
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
        try {
          await this.dlcMessageService.sendDlcMessage(
            rejectMessage,
            rejectedContract.counterPartyName
          )
          return rejectedContract
        } catch (e) {
          const offeredContract = await this.eventHandler.onOfferAcceptFailed(
            contractId
          )
          throw new DlcError(e._message, offeredContract)
        }
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
        await this.checkForRefundableContracts()
      } catch (error) {
        this.logger.error(error)
      }
    })
  }

  private async getTxConfirmations(txId: string): Promise<number> {
    try {
      const transaction = await this.bitcoindClient.getTransaction(txId, true)
      return transaction.confirmations
    } catch (err) {
      //TODO(tibo): check that the error is about the tx)
      return -1
    }
  }

  private async checkForConfirmedThatMaturedContracts(): Promise<void> {
    const confirmedContracts = await this.dlcService.getConfirmedContractsToMature()
    for (const contract of confirmedContracts) {
      try {
        const result = await this.oracleClient.getAttestation(
          contract.assetId,
          DateTime.fromMillis(contract.maturityTime, { zone: 'utc' })
        )

        // TODO: Check if counter party closed even if request to oracle was
        // not successful.
        if (isSuccessful(result)) {
          const maturedContract = await this.eventHandler.onContractMature(
            contract.id,
            result.value.signatures,
            result.value.values
          )

          const closedByOther = await this.checkAndUpdateClosedByOther(
            maturedContract
          )

          if (!closedByOther) {
            await this.ipcClient.dlcUpdate(maturedContract)
            const closed = await this.eventHandler.onClosed(contract.id)
            await this.ipcClient.dlcUpdate(closed)
          }
        } else {
          this.logger.error(
            `Could not retrieve outcome from oracle for contract ${contract.id}: ${result.error}`
          )
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
          await this.ipcClient.dlcUpdate(confirmedContract)
        }
      } catch (error) {
        this.logger.error(`Error processing signed contract ${contract.id}`, {
          error,
          message: error.message,
        })
      }
    }
  }

  private async checkForRefundableContracts(): Promise<void> {
    const contracts = (await this.dlcService.getRefundableContracts()) as ConfirmedContract[]

    for (const contract of contracts) {
      try {
        const refundTx = Utils.decodeRawTransaction(
          contract.refundTxHex,
          this.bitcoindClient.getNetwork()
        )
        const confs = await this.getTxConfirmations(refundTx.txid)
        if (confs > 0) {
          const refundedContract = await this.eventHandler.onContractRefundByOther(
            contract.id
          )
          await this.ipcClient.dlcUpdate(refundedContract)
        } else {
          const refundedContract = await this.eventHandler.onContractRefund(
            contract.id
          )
          await this.ipcClient.dlcUpdate(refundedContract)
        }
      } catch (error) {
        this.logger.error(
          `Error processing refund for contract ${contract.id}`,
          { error, message: error.message }
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
          `Error processing message from ${abstractMessage.from}`,
          { error, message: error.message }
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

  private async checkAndUpdateClosedByOther(
    contract: MaturedContract
  ): Promise<boolean> {
    const clothedByOther =
      (await this.getTxConfirmations(contract.finalCetId)) >= 0

    if (clothedByOther) {
      const unilateralClosedByOther = await this.eventHandler.onClosedByOther(
        contract.id
      )
      await this.ipcClient.dlcUpdate(unilateralClosedByOther)
      return true
    }
    return false
  }
}
