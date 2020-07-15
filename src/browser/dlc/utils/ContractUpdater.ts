import * as cfddlcjs from 'cfd-dlc-js'
import { DecodeRawTransactionResponse } from 'cfd-js'
import { DateTime, Duration } from 'luxon'
import { ContractState } from '../../../common/models/dlc/Contract'
import { Outcome } from '../../../common/models/dlc/Outcome'
import BitcoinDClient from '../../api/bitcoind'
import {
  AcceptedContract,
  BroadcastContract,
  ConfirmedContract,
  FailedContract,
  InitialContract,
  MaturedContract,
  MutualClosedContract,
  MutualCloseProposedContract,
  OfferedContract,
  PrivateParams,
  RefundedContract,
  RejectedContract,
  SignedContract,
  UnilateralClosedByOtherContract,
  UnilateralClosedContract,
} from '../models/contract'
import { MutualClosingMessage } from '../models/messages'
import { PartyInputs } from '../models/PartyInputs'
import { Utxo } from '../models/Utxo'
import * as Utils from './CfdUtils'
import { getCommonFee } from './FeeEstimator'

const csvDelay = 144
const proposeTimeOutDuration = Duration.fromObject({ seconds: 30 })

const witnessV0KeyHash = 'witness_v0_keyhash'
const witnessV0ScriptHash = 'witness_v0_scripthash'

enum DustDiscardedParty {
  local = 1,
  remote,
  none,
}

export class ContractUpdater {
  readonly walletClient: BitcoinDClient

  constructor(walletClient: BitcoinDClient) {
    this.walletClient = walletClient
  }

  private getTotalInputAmount(partyInputs: PartyInputs): number {
    return partyInputs.utxos.reduce<number>((prev, cur) => prev + cur.amount, 0)
  }

  private async getNewPrivateParams(utxos: Utxo[]): Promise<PrivateParams> {
    const fundPrivateKey = await this.walletClient.getNewPrivateKey()
    const sweepPrivateKey = await this.walletClient.getNewPrivateKey()
    const inputPrivateKeys = await Promise.all(
      utxos.map(
        async input => await this.walletClient.dumpPrivHex(input.address)
      )
    )

    return {
      fundPrivateKey,
      sweepPrivateKey,
      inputPrivateKeys,
    }
  }

  private async getPartyInputs(
    privateParams: PrivateParams,
    utxos: Utxo[]
  ): Promise<PartyInputs> {
    const fundPublicKey = Utils.getPubkeyFromPrivkey(
      privateParams.fundPrivateKey
    )
    const sweepPublicKey = Utils.getPubkeyFromPrivkey(
      privateParams.sweepPrivateKey
    )
    const changeAddress = await this.walletClient.getNewAddress()
    const finalAddress = await this.walletClient.getNewAddress()

    return {
      fundPublicKey,
      sweepPublicKey,
      changeAddress,
      finalAddress,
      utxos,
    }
  }

  async toOfferedContract(
    contract: InitialContract,
    localPartyInputs?: PartyInputs
  ): Promise<OfferedContract> {
    const collateral = contract.isLocalParty
      ? contract.localCollateral
      : contract.remoteCollateral
    const commonFee = getCommonFee(contract.feeRate)
    let privateParams: PrivateParams | undefined = undefined

    if (!localPartyInputs) {
      const utxos = await this.walletClient.getUtxosForAmount(
        collateral + commonFee,
        contract.feeRate
      )
      privateParams = await this.getNewPrivateParams(utxos)
      localPartyInputs = await this.getPartyInputs(privateParams, utxos)
    }

    return {
      ...contract,
      state: ContractState.Offered,
      localPartyInputs,
      privateParams,
    }
  }

  async toAcceptContract(
    contract: OfferedContract,
    remotePartyInputs?: PartyInputs,
    refundRemoteSignature?: string,
    remoteCetSignatures?: ReadonlyArray<string>
  ): Promise<AcceptedContract> {
    let privateParams = contract.privateParams
    if (!remotePartyInputs || !privateParams) {
      const utxos = await this.walletClient.getUtxosForAmount(
        contract.remoteCollateral,
        contract.feeRate
      )
      privateParams = await this.getNewPrivateParams(utxos)
      remotePartyInputs = await this.getPartyInputs(privateParams, utxos)
    }

    const dlcTxRequest: cfddlcjs.CreateDlcTransactionsRequest = {
      outcomes: contract.outcomes.map(outcome => {
        return {
          messages: [outcome.message],
          local: outcome.local,
          remote: outcome.remote,
        }
      }),
      oracleRPoints: [contract.oracleInfo.rValue],
      oraclePubkey: contract.oracleInfo.publicKey,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      localSweepPubkey: contract.localPartyInputs.sweepPublicKey,
      localFinalAddress: contract.localPartyInputs.finalAddress,
      remoteFundPubkey: remotePartyInputs.fundPublicKey,
      remoteSweepPubkey: remotePartyInputs.sweepPublicKey,
      remoteFinalAddress: remotePartyInputs.finalAddress,
      localInputAmount: this.getTotalInputAmount(contract.localPartyInputs),
      localCollateralAmount: contract.localCollateral,
      remoteInputAmount: this.getTotalInputAmount(remotePartyInputs),
      remoteCollateralAmount: contract.remoteCollateral,
      csvDelay: csvDelay,
      localInputs: [...contract.localPartyInputs.utxos],
      remoteInputs: [...remotePartyInputs.utxos],
      localChangeAddress: contract.localPartyInputs.changeAddress,
      remoteChangeAddress: remotePartyInputs.changeAddress,
      feeRate: contract.feeRate,
      // Substract two hours to avoid the nLockTime for now
      maturityTime: Math.floor(contract.maturityTime / 1000) - 2 * 3600,
      // TODO(tibo): set refund time as parameter
      refundLocktime: Math.floor(contract.maturityTime / 1000) + 86400 * 7,
    }

    const dlcTransactions = cfddlcjs.CreateDlcTransactions(dlcTxRequest)
    const fundTxHex = dlcTransactions.fundTxHex
    const fundTransaction = Utils.decodeRawTransaction(
      fundTxHex,
      this.walletClient.getNetwork()
    )
    const fundTxId = fundTransaction.txid
    if (!fundTransaction.vout) {
      throw new Error('Unexpected state: fund transaction has no vout.')
    }
    const fundTxOutAmount = Number(fundTransaction.vout[0].value)
    const refundTxHex = dlcTransactions.refundTxHex
    const localCetsHex = dlcTransactions.localCetsHex
    const remoteCetsHex = dlcTransactions.remoteCetsHex

    if (
      fundTransaction.vout[0].scriptPubKey &&
      fundTransaction.vout[0].scriptPubKey.addresses
    ) {
      await this.walletClient.importAddress(
        fundTransaction.vout[0].scriptPubKey.addresses[0]
      )
    }

    remoteCetSignatures =
      remoteCetSignatures ||
      this.getCetSignatures(
        contract,
        privateParams,
        localCetsHex,
        fundTxId,
        fundTxOutAmount,
        remotePartyInputs
      )
    refundRemoteSignature =
      refundRemoteSignature ||
      this.getRefundTxSignature(
        contract,
        privateParams,
        refundTxHex,
        fundTxId,
        fundTxOutAmount,
        remotePartyInputs
      )

    return {
      ...contract,
      state: ContractState.Accepted,
      privateParams,
      remotePartyInputs,
      fundTxHex,
      fundTxId,
      fundTxOutAmount,
      refundTxHex,
      refundRemoteSignature,
      localCetsHex,
      remoteCetsHex,
      remoteCetSignatures: remoteCetSignatures,
    }
  }

  private getCetSignatures(
    contract: AcceptedContract | OfferedContract | SignedContract,
    privateParams: PrivateParams,
    cetsHex: ReadonlyArray<string>,
    fundTxId: string,
    fundTxOutAmount: number,
    remotePartyInputs: PartyInputs
  ): string[] {
    const cetSignRequest: cfddlcjs.GetRawCetSignaturesRequest = {
      cetsHex: [...cetsHex],
      privkey: privateParams.fundPrivateKey,
      fundTxId: fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: remotePartyInputs.fundPublicKey,
      fundInputAmount: fundTxOutAmount,
    }

    return cfddlcjs.GetRawCetSignatures(cetSignRequest).hex
  }

  getRefundTxSignature(
    contract: AcceptedContract | OfferedContract,
    privateParams: PrivateParams,
    refundTxHex: string,
    fundTxId: string,
    fundTxOutAmount: number,
    remotePartyInputs: PartyInputs
  ): string {
    const refundSignRequest: cfddlcjs.GetRawRefundTxSignatureRequest = {
      refundTxHex: refundTxHex,
      privkey: privateParams.fundPrivateKey,
      fundTxId: fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: remotePartyInputs.fundPublicKey,
      fundInputAmount: fundTxOutAmount,
    }

    return cfddlcjs.GetRawRefundTxSignature(refundSignRequest).hex
  }

  getFundTxSignatures(contract: AcceptedContract): string[] {
    const utxos = contract.isLocalParty
      ? contract.localPartyInputs.utxos
      : contract.remotePartyInputs.utxos
    const fundTxSigs = utxos.map((input, index) => {
      const fundTxSignRequest: cfddlcjs.GetRawFundTxSignatureRequest = {
        fundTxHex: contract.fundTxHex,
        privkey: contract.privateParams.inputPrivateKeys[index],
        prevTxId: input.txid,
        prevVout: input.vout,
        amount: input.amount,
      }

      return cfddlcjs.GetRawFundTxSignature(fundTxSignRequest).hex
    })

    return fundTxSigs
  }

  getFundTxPubkeys(contract: AcceptedContract): string[] {
    return contract.privateParams.inputPrivateKeys.map(x =>
      Utils.getPubkeyFromPrivkey(x)
    )
  }

  verifySignedContract(contract: SignedContract): boolean {
    return this.verifyContractSignatures(contract, false)
  }

  verifyAcceptedContract(contract: AcceptedContract): boolean {
    return this.verifyContractSignatures(contract, true)
  }

  private verifyContractSignatures(
    contract: AcceptedContract | SignedContract,
    verifyRemote: boolean
  ): boolean {
    const cets = verifyRemote ? contract.localCetsHex : contract.remoteCetsHex
    let signatures: string[] = []

    if (!verifyRemote && 'localCetSignatures' in contract) {
      signatures = [...contract.localCetSignatures]
    } else if (verifyRemote) {
      signatures = [...contract.remoteCetSignatures]
    } else {
      throw Error('Invalid State')
    }

    const verifyCetSignaturesRequest: cfddlcjs.VerifyCetSignaturesRequest = {
      cetsHex: [...cets],
      signatures,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
      fundTxId: contract.fundTxId,
      fundInputAmount: contract.fundTxOutAmount,
      verifyRemote,
    }

    const hasValidCetSigs = cfddlcjs.VerifyCetSignatures(
      verifyCetSignaturesRequest
    ).valid

    let refundSignature = ''

    if (!verifyRemote && 'refundLocalSignature' in contract) {
      refundSignature = contract.refundLocalSignature
    } else if (verifyRemote) {
      refundSignature = contract.refundRemoteSignature
    } else {
      throw Error('Invalid state')
    }

    const verifyRefundSigRequest: cfddlcjs.VerifyRefundTxSignatureRequest = {
      refundTxHex: contract.refundTxHex,
      signature: refundSignature,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
      fundTxId: contract.fundTxId,
      fundInputAmount: contract.fundTxOutAmount,
      verifyRemote,
    }

    return (
      hasValidCetSigs &&
      cfddlcjs.VerifyRefundTxSignature(verifyRefundSigRequest).valid
    )
  }

  async toSignedContract(
    contract: AcceptedContract,
    localFundTxSignatures?: ReadonlyArray<string>,
    localFundTxPubkeys?: ReadonlyArray<string>,
    localRefundSignature?: string,
    localCetSignatures?: ReadonlyArray<string>
  ): Promise<SignedContract> {
    localFundTxSignatures =
      localFundTxSignatures || this.getFundTxSignatures(contract)

    localFundTxPubkeys = localFundTxPubkeys || this.getFundTxPubkeys(contract)

    localRefundSignature =
      localRefundSignature ||
      this.getRefundTxSignature(
        contract,
        contract.privateParams,
        contract.refundTxHex,
        contract.fundTxId,
        contract.fundTxOutAmount,
        contract.remotePartyInputs
      )

    localCetSignatures =
      localCetSignatures ||
      this.getCetSignatures(
        contract,
        contract.privateParams,
        [...contract.remoteCetsHex],
        contract.fundTxId,
        contract.fundTxOutAmount,
        contract.remotePartyInputs
      )

    return {
      ...contract,
      state: ContractState.Signed,
      fundTxSignatures: localFundTxSignatures,
      localUtxoPublicKeys: localFundTxPubkeys,
      refundLocalSignature: localRefundSignature,
      localCetSignatures,
    }
  }

  async toBroadcast(contract: SignedContract): Promise<BroadcastContract> {
    let fundTxHex = contract.fundTxHex

    contract.remotePartyInputs.utxos.forEach((input, i) => {
      const fundSignRequest: cfddlcjs.SignFundTransactionRequest = {
        fundTxHex,
        privkey: contract.privateParams.inputPrivateKeys[i],
        prevTxId: input.txid,
        prevVout: input.vout,
        amount: input.amount,
      }

      fundTxHex = cfddlcjs.SignFundTransaction(fundSignRequest).hex
    })

    contract.fundTxSignatures.forEach((signature, index) => {
      const addSignRequest: cfddlcjs.AddSignatureToFundTransactionRequest = {
        fundTxHex,
        signature,
        prevTxId: contract.localPartyInputs.utxos[index].txid,
        prevVout: contract.localPartyInputs.utxos[index].vout,
        pubkey: contract.localUtxoPublicKeys[index],
      }
      fundTxHex = cfddlcjs.AddSignatureToFundTransaction(addSignRequest).hex
    })

    await this.walletClient.sendRawTransaction(fundTxHex)

    return { ...contract, state: ContractState.Broadcast }
  }

  async ToMutualClosedProposed(
    contract: MaturedContract,
    outcome: Outcome
  ): Promise<MutualCloseProposedContract> {
    const mutualClosingRequest = {
      localFinalAddress: contract.localPartyInputs.finalAddress,
      remoteFinalAddress: contract.remotePartyInputs.finalAddress,
      localAmount: outcome.local,
      remoteAmount: outcome.remote,
      fundTxId: contract.fundTxId,
      feeRate: contract.feeRate,
    }

    const mutualClosingTxHex = cfddlcjs.CreateMutualClosingTransaction(
      mutualClosingRequest
    ).hex

    const mutualClosingTx = Utils.decodeRawTransaction(
      mutualClosingTxHex,
      this.walletClient.getNetwork()
    )

    this.importTxIfRequired(mutualClosingTx, contract)

    const finalOutcome = this.getFinalOutcomeWithDiscardedDust(
      mutualClosingTx,
      contract
    )

    const signRequest: cfddlcjs.GetRawMutualClosingTxSignatureRequest = {
      fundTxId: contract.fundTxId,
      mutualClosingHex: mutualClosingTxHex,
      privkey: contract.privateParams.fundPrivateKey,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
      fundInputAmount: contract.fundTxOutAmount,
    }

    const signature = cfddlcjs.GetRawMutualClosingTxSignature(signRequest).hex

    return {
      ...contract,
      finalOutcome,
      state: ContractState.MutualCloseProposed,
      mutualCloseTx: mutualClosingTxHex,
      mutualCloseTxId: mutualClosingTx.txid,
      ownMutualClosingSignature: signature,
      proposeTimeOut: DateTime.utc()
        .plus(proposeTimeOutDuration)
        .toMillis(),
    }
  }

  async toMutualClosed(
    contract: MaturedContract,
    mutualClosingMessage: MutualClosingMessage
  ): Promise<MutualClosedContract> {
    const mutualClosingRequest = {
      localFinalAddress: contract.localPartyInputs.finalAddress,
      remoteFinalAddress: contract.remotePartyInputs.finalAddress,
      localAmount: mutualClosingMessage.outcome.local,
      remoteAmount: mutualClosingMessage.outcome.remote,
      fundTxId: contract.fundTxId,
      feeRate: contract.feeRate,
    }

    let mutualClosingTxHex = cfddlcjs.CreateMutualClosingTransaction(
      mutualClosingRequest
    ).hex

    const signRequest: cfddlcjs.GetRawMutualClosingTxSignatureRequest = {
      fundTxId: contract.fundTxId,
      mutualClosingHex: mutualClosingTxHex,
      privkey: contract.privateParams.fundPrivateKey,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
      fundInputAmount: contract.fundTxOutAmount,
    }

    const signature = cfddlcjs.GetRawMutualClosingTxSignature(signRequest).hex

    const signatures = contract.isLocalParty
      ? [signature, mutualClosingMessage.signature]
      : [mutualClosingMessage.signature, signature]

    const addSigsRequest: cfddlcjs.AddSignaturesToMutualClosingTxRequest = {
      mutualClosingTxHex: mutualClosingTxHex,
      signatures,
      fundTxId: contract.fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
    }

    mutualClosingTxHex = cfddlcjs.AddSignaturesToMutualClosingTx(addSigsRequest)
      .hex

    const mutualClosingTx = Utils.decodeRawTransaction(
      mutualClosingTxHex,
      this.walletClient.getNetwork()
    )

    const finalOutcome = this.getFinalOutcomeWithDiscardedDust(
      mutualClosingTx,
      contract
    )

    await this.walletClient.sendRawTransaction(mutualClosingTxHex)

    return {
      ...contract,
      finalOutcome,
      state: ContractState.MutualClosed,
      mutualCloseTx: mutualClosingTxHex,
      mutualCloseTxId: mutualClosingTx.txid,
      mutualCloseSignature: mutualClosingMessage.signature,
    }
  }

  toMutualClosedConfirmed(
    contract: MutualCloseProposedContract
  ): MutualClosedContract {
    return {
      ...contract,
      state: ContractState.MutualClosed,
    }
  }

  async toUnilateralClosed(
    contract: MaturedContract
  ): Promise<UnilateralClosedContract> {
    const cets = contract.isLocalParty
      ? contract.localCetsHex
      : contract.remoteCetsHex

    const outcomeIndex = contract.outcomes.findIndex(
      outcome => outcome.message === contract.finalOutcome.message
    )

    let cetHex = cets[outcomeIndex]

    const signRequest: cfddlcjs.GetRawCetSignatureRequest = {
      cetHex,
      privkey: contract.privateParams.fundPrivateKey,
      fundTxId: contract.fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
      fundInputAmount: contract.fundTxOutAmount,
    }

    const cetSign = cfddlcjs.GetRawCetSignature(signRequest).hex

    const signatures = contract.isLocalParty
      ? [cetSign, contract.remoteCetSignatures[outcomeIndex]]
      : [contract.localCetSignatures[outcomeIndex], cetSign]

    const addSignRequest: cfddlcjs.AddSignaturesToCetRequest = {
      cetHex,
      signatures,
      fundTxId: contract.fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
    }

    cetHex = cfddlcjs.AddSignaturesToCet(addSignRequest).hex

    const cet = Utils.decodeRawTransaction(
      cetHex,
      this.walletClient.getNetwork()
    )

    if (cet.vout === undefined || cet.vout.length === 0) {
      throw new Error('CET has no vout.')
    }

    const finalOutcome = this.getFinalOutcomeWithDiscardedDust(cet, contract)

    if (
      (contract.isLocalParty && finalOutcome.local === 0) ||
      (!contract.isLocalParty && finalOutcome.remote === 0)
    ) {
      await this.walletClient.sendRawTransaction(cetHex)
      return {
        ...contract,
        finalOutcome,
        state: ContractState.UnilateralClosed,
        finalCetTxId: cet.txid,
      }
    }

    const outcomeAmount = contract.isLocalParty
      ? contract.outcomes[outcomeIndex].local
      : contract.outcomes[outcomeIndex].remote

    const partyInputs = contract.isLocalParty
      ? contract.localPartyInputs
      : contract.remotePartyInputs
    const closingTxRequest: cfddlcjs.CreateClosingTransactionRequest = {
      address: partyInputs.finalAddress,
      amount: outcomeAmount,
      cetTxId: cet.txid,
    }

    let closingTxHex = cfddlcjs.CreateClosingTransaction(closingTxRequest).hex

    const remoteSweepKey = contract.isLocalParty
      ? contract.remotePartyInputs.sweepPublicKey
      : contract.localPartyInputs.sweepPublicKey

    const signClosingRequest: cfddlcjs.SignClosingTransactionRequest = {
      closingTxHex,
      cetTxId: cet.txid,
      amount: cet.vout[0].value,
      localFundPrivkey: contract.privateParams.fundPrivateKey,
      localSweepPubkey: partyInputs.sweepPublicKey,
      remoteSweepPubkey: remoteSweepKey,
      oraclePubkey: contract.oracleInfo.publicKey,
      oracleRPoints: [contract.oracleInfo.rValue],
      oracleSigs: [contract.oracleSignature],
      messages: [contract.outcomes[outcomeIndex].message],
      csvDelay: csvDelay,
    }

    closingTxHex = cfddlcjs.SignClosingTransaction(signClosingRequest).hex

    const closingTx = Utils.decodeRawTransaction(
      closingTxHex,
      this.walletClient.getNetwork()
    )

    await this.walletClient.sendRawTransaction(cetHex)
    await this.walletClient.sendRawTransaction(closingTxHex)

    return {
      ...contract,
      finalOutcome,
      state: ContractState.UnilateralClosed,
      finalCetTxId: cet.txid,
      closingTxId: closingTx.txid,
      closingTxHex,
    }
  }

  async toUnilateralClosedByOther(
    contract: MaturedContract | MutualCloseProposedContract
  ): Promise<UnilateralClosedByOtherContract> {
    const finalCetTxHex = (
      await this.walletClient.getTransaction(
        contract.otherPartyFinalCetId,
        true
      )
    ).hex

    const finalCetTx = Utils.decodeRawTransaction(
      finalCetTxHex,
      this.walletClient.getNetwork()
    )

    const finalOutcome = this.getFinalOutcomeWithDiscardedDust(
      finalCetTx,
      contract,
      false
    )

    return {
      ...contract,
      finalOutcome,
      state: ContractState.UnilateralClosedByOther,
    }
  }

  toMatureContract(
    contract: ConfirmedContract,
    outcomeValue: string,
    oracleSignature: string
  ): MaturedContract {
    const finalOutcomeIndex = contract.outcomes.findIndex(
      x => x.message === outcomeValue
    )
    if (finalOutcomeIndex < 0) {
      throw new Error(
        "Could not find final outcome in the list of contract's outcomes."
      )
    }

    // Keep track of other party CET if necessary to be able to watch it through the
    // bitcoind wallet
    const otherPartyCets = contract.isLocalParty
      ? contract.remoteCetsHex
      : contract.localCetsHex
    const finalCetHex = otherPartyCets[finalOutcomeIndex]
    const finalCet = Utils.decodeRawTransaction(
      finalCetHex,
      this.walletClient.getNetwork()
    )

    return {
      ...contract,
      state: ContractState.Mature,
      finalOutcome: contract.outcomes[finalOutcomeIndex],
      oracleSignature,
      otherPartyFinalCetId: finalCet.txid,
    }
  }

  toConfirmedContract(contract: BroadcastContract): ConfirmedContract {
    return { ...contract, state: ContractState.Confirmed }
  }

  async toRefundedContract(
    contract: SignedContract
  ): Promise<RefundedContract> {
    const reqJson: cfddlcjs.AddSignaturesToRefundTxRequest = {
      refundTxHex: contract.refundTxHex,
      fundTxId: contract.fundTxId,
      signatures: [
        contract.refundLocalSignature,
        contract.refundRemoteSignature,
      ],
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
    }
    const refundTxHex = cfddlcjs.AddSignaturesToRefundTx(reqJson).hex

    await this.walletClient.sendRawTransaction(refundTxHex)
    return { ...contract, state: ContractState.Refunded }
  }

  async toRejectedContract(
    contract: OfferedContract | AcceptedContract | SignedContract,
    reason?: string
  ): Promise<RejectedContract> {
    await this.unlockUtxos(contract)
    return {
      ...contract,
      state: ContractState.Rejected,
      reason,
    }
  }

  async toFailedContract(
    contract: OfferedContract | AcceptedContract,
    reason: string
  ): Promise<FailedContract> {
    await this.unlockUtxos(contract)
    return {
      ...contract,
      state: ContractState.Failed,
      reason,
    }
  }

  private async unlockUtxos(
    contract: OfferedContract | AcceptedContract | SignedContract
  ): Promise<void> {
    let utxos: ReadonlyArray<Utxo> = []
    if (contract.isLocalParty) {
      utxos = contract.localPartyInputs.utxos
    } else if ('remotePartyInputs' in contract) {
      utxos = contract.remotePartyInputs.utxos
    }

    await this.walletClient.lockUtxos([...utxos], true)
  }

  private getDustDiscardedParty(
    tx: DecodeRawTransactionResponse,
    contract: ConfirmedContract | MaturedContract | MutualCloseProposedContract,
    ownTransaction = true
  ): DustDiscardedParty {
    if (tx.vout && tx.vout.length === 1) {
      const vout = tx.vout[0]
      if (
        vout.scriptPubKey &&
        vout.scriptPubKey.type === witnessV0KeyHash &&
        vout.scriptPubKey.addresses
      ) {
        if (
          vout.scriptPubKey.addresses.includes(
            contract.localPartyInputs.finalAddress
          )
        ) {
          return DustDiscardedParty.remote
        } else if (
          vout.scriptPubKey.addresses.includes(
            contract.remotePartyInputs.finalAddress
          )
        ) {
          return DustDiscardedParty.local
        }
      } else if (
        vout.scriptPubKey &&
        vout.scriptPubKey.type === witnessV0ScriptHash
      ) {
        if (
          (contract.isLocalParty && ownTransaction) ||
          (!contract.isLocalParty && !ownTransaction)
        ) {
          return DustDiscardedParty.remote
        } else {
          return DustDiscardedParty.local
        }
      }
    }

    return DustDiscardedParty.none
  }

  private getFinalOutcomeWithDiscardedDust(
    tx: DecodeRawTransactionResponse,
    contract: MaturedContract | MutualCloseProposedContract,
    ownTransaction = true
  ): Outcome {
    const discardedParty = this.getDustDiscardedParty(
      tx,
      contract,
      ownTransaction
    )

    switch (discardedParty) {
      case DustDiscardedParty.local:
        return {
          ...contract.finalOutcome,
          local: 0,
        }
      case DustDiscardedParty.remote:
        return {
          ...contract.finalOutcome,
          remote: 0,
        }
      default:
        return contract.finalOutcome
    }
  }

  private async importTxIfRequired(
    tx: DecodeRawTransactionResponse,
    contract: MaturedContract | ConfirmedContract,
    pubkey?: string
  ): Promise<void> {
    const discardedParty = this.getDustDiscardedParty(tx, contract, false)

    if (
      (discardedParty === DustDiscardedParty.local && contract.isLocalParty) ||
      (discardedParty === DustDiscardedParty.remote && !contract.isLocalParty)
    ) {
      if (pubkey) {
        await this.walletClient.importPublicKey(pubkey)
      } else if (
        tx.vout &&
        tx.vout[0].scriptPubKey &&
        tx.vout[0].scriptPubKey.addresses
      ) {
        await this.walletClient.importAddress(
          tx.vout[0].scriptPubKey.addresses[0]
        )
      }
    }
  }
}
