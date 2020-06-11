import { DlcEventHandler, DlcError } from './DlcEventHandler'
import { DlcService } from '../service/DlcService'
import BitcoinDClient from '../../api/bitcoind'
import { SignedContract } from './contract/SignedContract'
import { DlcBrowserAPI } from '../../ipc/DlcBrowserAPI'
import { MutualCloseProposedContract } from './contract/MutualCloseProposedContract'
import { DateTime } from 'luxon'
import { isSuccessful } from '../../../common/utils/failable'
import { DlcMessageServiceApi } from '../../api/grpc/DlcMessageService'
import { Contract } from '../../../common/models/dlc/Contract'
import { Outcome } from '../../../common/models/dlc/Outcome'
import { Logger } from 'winston'
import { DlcMessageType } from './DlcTypedMessage'
import { DlcAbstractMessage } from './DlcAbstractMessage'
import { AcceptMessage } from './AcceptMessage'
import { MutualClosingMessage } from './MutualClosingMessage'
import { OfferMessage } from './OfferMessage'
import { SignMessage } from './SignMessage'
import { RejectMessage } from './RejectMessage'
import { RejectedContract } from './contract/RejectedContract'
import { AcceptedContract } from './contract/AcceptedContract'
import { OfferedContract } from './contract/OfferedContract'
import { OracleClientApi } from '../../api/oracle/oracleClient'
import { Mutex } from 'await-semaphore'
import {
  fromContract,
  toContract,
  ContractSimple,
} from '../../../common/models/ipc/ContractSimple'
import { OracleInfo } from '../../../common/models/dlc/OracleInfo'

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
    this.dlcMessageService.getDlcMessageStream().on('data', data => {
      this.OnDlcMessage(data as DlcAbstractMessage)
    })
    this.timeoutHandle = setInterval(
      () => this.periodicChecks(),
      timeOutSeconds * 1000
    )

    this.mutex = new Mutex()
  }

  finalize() {
    this.timeoutHandle.unref()
  }

  async SendContractOffer(
    contractSimple: ContractSimple
  ): Promise<OfferedContract> {
    try {
      const maturityTime = DateTime.fromISO(contractSimple.maturityTime, {
        setZone: true,
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
      const contract = toContract(contractSimple, oracleInfo)
      const offeredContract = await this.eventHandler.OnSendOffer(contract)
      const offerMessage = offeredContract.ToOfferMessage()
      await this.dlcMessageService.sendDlcMessage(
        offerMessage,
        contract.counterPartyName
      )

      return offeredContract
    } catch (error) {
      this.logger.error(
        `Could not offer contract ${contractSimple.id}: ${error}`
      )
      throw error
    }
  }

  async AcceptContractOffer(contractId: string): Promise<AcceptedContract> {
    try {
      const acceptContract = await this.eventHandler.OnOfferAccepted(contractId)
      const acceptMessage = acceptContract.ToAcceptMessage()
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

  async RejectContractOffer(contractId: string): Promise<RejectedContract> {
    try {
      const rejectedContract = await this.eventHandler.OnRejectContract(
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

  private async GetTxConfirmations(txId: string): Promise<number> {
    try {
      const transaction = await this.bitcoindClient.getTransaction(txId)

      return transaction.confirmations
    } catch (err) {
      return -1
    }
  }

  private async TrySendMutualCloseOffer(
    contract: Contract,
    outcome: Outcome
  ): Promise<boolean> {
    const mutualCloseProposeContract = await this.eventHandler.OnSendMutualCloseOffer(
      contract.id,
      outcome
    )
    const mutualCloseMessage = mutualCloseProposeContract.ToMutualClosingMessage()
    await this.ipcClient.dlcUpdate(fromContract(mutualCloseProposeContract))

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
    const matureContracts = await this.dlcService.GetConfirmedContractsToMature()
    for (const contract of matureContracts) {
      try {
        const result = await this.oracleClient.getSignature(
          contract.oracleInfo.assetId,
          contract.maturityTime
        )

        if (isSuccessful(result)) {
          const value = result.value
          const outcome = contract.outcomes.find(x => x.message == value.value)
          if (!outcome) {
            this.logger.error('Contract outcome not in the outcome list.')
            // Not much to do, contract will need to be closed with refund
            continue
          }
          const maturedContract = await this.eventHandler.OnContractMature(
            contract.id,
            value.value,
            value.signature
          )
          await this.ipcClient.dlcUpdate(fromContract(maturedContract))
          const offered = await this.TrySendMutualCloseOffer(contract, outcome)
          if (!offered) {
            const unilateralClosed = await this.eventHandler.OnUnilateralClose(
              contract.id
            )
            await this.ipcClient.dlcUpdate(fromContract(unilateralClosed))
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
    const contracts = (await this.dlcService.GetSignedAndBroadcastContracts()) as SignedContract[]

    for (const contract of contracts) {
      try {
        // TODO(tibo): set confirmation number as configuration parameter
        if ((await this.GetTxConfirmations(contract.fundTxId)) >= 6) {
          const confirmedContract = await this.eventHandler.OnContractConfirmed(
            contract.id
          )
          // TODO(tibo): refactor ipc call to remove eventtype
          await this.ipcClient.dlcUpdate(fromContract(confirmedContract))
        }
      } catch (error) {
        this.logger.error(
          `Error processing signed contract ${contract.id}: ${error}`
        )
      }
    }
  }

  private async checkForMutualCloseProposedContracts() {
    const contracts = (await this.dlcService.GetMutualCloseOfferedContracts()) as MutualCloseProposedContract[]
    const utcNow = DateTime.utc()

    for (const contract of contracts) {
      try {
        const confirmations = await this.GetTxConfirmations(
          contract.mutualCloseTxId
        )
        if (confirmations < 0 && contract.proposeTimeOut <= utcNow) {
          // TODO(tibo): Should move to intermediary state and later verify
          // that cet and closeTx are confirmed.
          const closedContract = await this.eventHandler.OnUnilateralClose(
            contract.id
          )
          await this.ipcClient.dlcUpdate(fromContract(closedContract))
        } else if (confirmations >= 0) {
          // TOD(tibo): Should have an intermediary to distinguished between
          // mutual close broadcast and confirmed.
          const mutualClosedContract = await this.eventHandler.OnMutualCloseConfirmed(
            contract.id
          )
          await this.ipcClient.dlcUpdate(fromContract(mutualClosedContract))
        }
      } catch (error) {
        this.logger.error(
          `Error processing mutual proposed contract ${contract.id}: ${error}`
        )
      }
    }
  }

  private async checkForRefundableContracts() {
    const contracts = await this.dlcService.GetRefundableContracts()

    for (const contract of contracts) {
      try {
        await this.eventHandler.OnContractRefund(contract.id)
      } catch (error) {
        this.logger.error(
          `Error processing refund for contract ${contract.id}: ${error}`
        )
      }
    }
  }

  private async OnDlcMessage(abstractMessage: DlcAbstractMessage) {
    const release = await this.mutex.acquire()
    try {
      const message = abstractMessage.payload
      const from = abstractMessage.from
      switch (message.messageType) {
        case DlcMessageType.Accept:
          await this.HandleAcceptMessage(from, message as AcceptMessage)
          break
        case DlcMessageType.MutualCloseOffer:
          await this.HandleMutualCloseOffer(
            from,
            message as MutualClosingMessage
          )
          break
        case DlcMessageType.Offer:
          await this.HandleOffer(from, message as OfferMessage)
          break
        case DlcMessageType.Reject:
          await this.HandleReject(from, message as RejectMessage)
          break
        case DlcMessageType.Sign:
          await this.HandleSign(from, message as SignMessage)
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

  private async HandleAcceptMessage(
    from: string,
    acceptMessage: AcceptMessage
  ) {
    const { contract, message } = await this.eventHandler.OnAcceptMessage(
      from,
      acceptMessage
    )
    this.dlcMessageService.sendDlcMessage(message, from)
    await this.ipcClient.dlcUpdate(fromContract(contract))
  }

  private async HandleMutualCloseOffer(
    from: string,
    message: MutualClosingMessage
  ) {
    const mutualClosedContract = await this.eventHandler.OnMutualCloseOffer(
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

    await this.ipcClient.dlcUpdate(fromContract(mutualClosedContract))
  }

  private async HandleOffer(from: string, message: OfferMessage) {
    const offerContract = await this.eventHandler.OnOfferMessage(message, from)

    await this.ipcClient.dlcUpdate(fromContract(offerContract))
  }

  private async HandleSign(from: string, message: SignMessage) {
    const broadcastContract = await this.eventHandler.OnSignMessage(
      from,
      message
    )

    await this.ipcClient.dlcUpdate(fromContract(broadcastContract))
  }

  private async HandleReject(from: string, message: RejectMessage) {
    const rejectedContract = await this.eventHandler.OnContractRejected(
      message.contractId,
      from
    )

    // TODO(Wesley): refactor ipc call
    await this.ipcClient.dlcUpdate(fromContract(rejectedContract))
  }
}
