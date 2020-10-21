import * as cfddlcjs from 'cfd-dlc-js'
import * as CfdUtils from './CfdUtils'
import { AdaptorPair } from '../models/AdaptorPair'
import { CfdError, DecodeRawTransactionResponse } from 'cfd-js'
import { ContractState } from '../../../common/models/dlc/Contract'
import { Outcome } from '../../../common/models/dlc/Outcome'
import BitcoinDClient from '../../api/bitcoind'
import {
  AcceptedContract,
  BroadcastContract,
  ConfirmedContract,
  FailedContract,
  InitialContract,
  isContractOfState,
  MaturedContract,
  ClosedContract,
  OfferedContract,
  PrivateParams,
  RefundedContract,
  RejectedContract,
  SignedContract,
} from '../models/contract'
import { PartyInputs } from '../models/PartyInputs'
import { Utxo } from '../models/Utxo'
import * as Utils from './CfdUtils'
import { DlcError } from './DlcEventHandler'
import { getCommonFee } from './FeeEstimator'

const witnessV0KeyHash = 'witness_v0_keyhash'
const witnessV0ScriptHash = 'witness_v0_scripthash'

const notEnoughUtxoErrorMessage = 'Not enough UTXO for collateral and fees.'

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
    utxos: Utxo[],
    premiumDestAddress = false
  ): Promise<PartyInputs> {
    const fundPublicKey = Utils.getPubkeyFromPrivkey(
      privateParams.fundPrivateKey
    )
    const sweepPublicKey = Utils.getPubkeyFromPrivkey(
      privateParams.sweepPrivateKey
    )
    const changeAddress = await this.walletClient.getNewAddress()
    const finalAddress = await this.walletClient.getNewAddress()
    const premiumDest = premiumDestAddress
      ? await this.walletClient.getNewAddress()
      : undefined

    return {
      fundPublicKey,
      sweepPublicKey,
      changeAddress,
      finalAddress,
      utxos,
      premiumDest,
    }
  }

  async toOfferedContract(
    contract: InitialContract | AcceptedContract,
    localPartyInputs?: PartyInputs
  ): Promise<OfferedContract> {
    const collateral = contract.isLocalParty
      ? contract.localCollateral
      : contract.remoteCollateral
    const halfCommonFee = Math.ceil(getCommonFee(contract.feeRate) / 2)
    const premiumAmount = contract.premiumAmount || 0
    let privateParams: PrivateParams | undefined = undefined

    if ('remotePartyInputs' in contract) {
      await this.unlockUtxos(contract)
    }

    if (!localPartyInputs) {
      try {
        const utxos = await this.walletClient.getUtxosForAmount(
          collateral + halfCommonFee + premiumAmount,
          contract.feeRate
        )
        privateParams = await this.getNewPrivateParams(utxos)
        localPartyInputs = await this.getPartyInputs(privateParams, utxos)
      } catch (e) {
        if ('code' in e && e.code === 'ECONNREFUSED') {
          throw new DlcError('Unable to connect to bitcoind')
        }
        if (e instanceof CfdError && e.getErrorInformation().code === 2) {
          throw new DlcError(notEnoughUtxoErrorMessage)
        }
        throw new DlcError('Unknown error')
      }
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
    remoteCetAdaptorPairs?: ReadonlyArray<AdaptorPair>
  ): Promise<AcceptedContract> {
    let privateParams = contract.privateParams
    if (!remotePartyInputs || !privateParams) {
      try {
        const halfCommonFee = Math.ceil(getCommonFee(contract.feeRate) / 2)
        const utxos = await this.walletClient.getUtxosForAmount(
          contract.remoteCollateral + halfCommonFee,
          contract.feeRate
        )
        privateParams = await this.getNewPrivateParams(utxos)
        remotePartyInputs = await this.getPartyInputs(
          privateParams,
          utxos,
          contract.premiumAmount !== undefined && contract.premiumAmount > 0
        )
      } catch {
        throw new DlcError(notEnoughUtxoErrorMessage)
      }
    }

    const payouts: { local: number; remote: number }[] = []
    const messages = []
    contract.outcomes.forEach(outcome => {
      payouts.push({
        local: outcome.local,
        remote: outcome.remote,
      })
      messages.push(outcome.message)
    })

    const dlcTxRequest: cfddlcjs.CreateDlcTransactionsRequest = {
      payouts,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      localFinalScriptPubkey: CfdUtils.getScriptForAddress(
        contract.localPartyInputs.finalAddress
      ),
      remoteFundPubkey: remotePartyInputs.fundPublicKey,
      remoteFinalScriptPubkey: CfdUtils.getScriptForAddress(
        remotePartyInputs.finalAddress
      ),
      localInputAmount: this.getTotalInputAmount(contract.localPartyInputs),
      localCollateralAmount: contract.localCollateral,
      remoteInputAmount: this.getTotalInputAmount(remotePartyInputs),
      remoteCollateralAmount: contract.remoteCollateral,
      localInputs: [...contract.localPartyInputs.utxos],
      remoteInputs: [...remotePartyInputs.utxos],
      localChangeScriptPubkey: CfdUtils.getScriptForAddress(
        contract.localPartyInputs.changeAddress
      ),
      remoteChangeScriptPubkey: CfdUtils.getScriptForAddress(
        remotePartyInputs.changeAddress
      ),
      feeRate: contract.feeRate,
      // TODO(tibo): set refund time as parameter
      refundLocktime: Math.floor(contract.maturityTime / 1000) + 86400 * 7,
      optionDest: remotePartyInputs.premiumDest,
      optionPremium: contract.premiumAmount,
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
    const cetsHex = dlcTransactions.cetsHex

    if (
      fundTransaction.vout[0].scriptPubKey &&
      fundTransaction.vout[0].scriptPubKey.addresses
    ) {
      await this.walletClient.importAddress(
        fundTransaction.vout[0].scriptPubKey.addresses[0]
      )
    }

    remoteCetAdaptorPairs =
      remoteCetAdaptorPairs ||
      this.getCetAdaptorSignatures(
        contract,
        privateParams,
        cetsHex,
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
      cetsHex,
      remoteCetAdaptorPairs,
    }
  }

  private getCetAdaptorSignatures(
    contract: AcceptedContract | OfferedContract | SignedContract,
    privateParams: PrivateParams,
    cetsHex: ReadonlyArray<string>,
    fundTxId: string,
    fundTxOutAmount: number,
    remotePartyInputs: PartyInputs
  ): AdaptorPair[] {
    const cetSignRequest: cfddlcjs.CreateCetAdaptorSignaturesRequest = {
      cetsHex: [...cetsHex],
      privkey: privateParams.fundPrivateKey,
      fundTxId: fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: remotePartyInputs.fundPublicKey,
      fundInputAmount: fundTxOutAmount,
      oraclePubkey: contract.oracleInfo.publicKey,
      oracleRValue: contract.oracleInfo.rValue,
      messages: contract.outcomes.map(x => x.message),
    }

    return cfddlcjs.CreateCetAdaptorSignatures(cetSignRequest).adaptorPairs
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
    const cets = contract.cetsHex
    let adaptorPairs: AdaptorPair[] = []

    if (!verifyRemote && 'localCetAdaptorPairs' in contract) {
      adaptorPairs = [...contract.localCetAdaptorPairs]
    } else if (verifyRemote) {
      adaptorPairs = [...contract.remoteCetAdaptorPairs]
    } else {
      throw Error('Invalid State')
    }

    const verifyCetSignaturesRequest: cfddlcjs.VerifyCetAdaptorSignaturesRequest = {
      cetsHex: [...cets],
      adaptorPairs,
      messages: contract.outcomes.map(x => x.message),
      oracleRValue: contract.oracleInfo.rValue,
      oraclePubkey: contract.oracleInfo.publicKey,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
      fundTxId: contract.fundTxId,
      fundInputAmount: contract.fundTxOutAmount,
      verifyRemote,
    }

    const hasValidCetSigs = cfddlcjs.VerifyCetAdaptorSignatures(
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
    localCetAdaptorSignatures?: ReadonlyArray<AdaptorPair>
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

    localCetAdaptorSignatures =
      localCetAdaptorSignatures ||
      this.getCetAdaptorSignatures(
        contract,
        contract.privateParams,
        [...contract.cetsHex],
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
      localCetAdaptorPairs: localCetAdaptorSignatures,
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

  async toClosed(contract: MaturedContract): Promise<ClosedContract> {
    const cets = contract.cetsHex

    const outcomeIndex = contract.outcomes.findIndex(
      outcome => outcome.message === contract.finalOutcome.message
    )

    let cetHex = cets[outcomeIndex]

    const signRequest: cfddlcjs.SignCetRequest = {
      cetHex,
      fundPrivkey: contract.privateParams.fundPrivateKey,
      fundTxId: contract.fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
      fundInputAmount: contract.fundTxOutAmount,
      adaptorSignature: contract.isLocalParty
        ? contract.remoteCetAdaptorPairs[outcomeIndex].signature
        : contract.localCetAdaptorPairs[outcomeIndex].signature,
      oracleSignature: contract.oracleSignature,
    }

    cetHex = cfddlcjs.SignCet(signRequest).hex

    const cet = Utils.decodeRawTransaction(
      cetHex,
      this.walletClient.getNetwork()
    )

    if (cet.vout === undefined || cet.vout.length === 0) {
      throw new Error('CET has no vout.')
    }

    const finalOutcome = this.getFinalOutcomeWithDiscardedDust(cet, contract)

    await this.walletClient.sendRawTransaction(cetHex)
    return {
      ...contract,
      finalOutcome,
      state: ContractState.Closed,
    }
  }

  async toClosedByOther(contract: MaturedContract): Promise<ClosedContract> {
    const finalCetTxHex = (
      await this.walletClient.getTransaction(contract.finalCetId, true)
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
      state: ContractState.Closed,
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
    const finalCetHex = contract.cetsHex[finalOutcomeIndex]
    const finalCet = Utils.decodeRawTransaction(
      finalCetHex,
      this.walletClient.getNetwork()
    )

    return {
      ...contract,
      state: ContractState.Mature,
      finalOutcome: contract.outcomes[finalOutcomeIndex],
      oracleSignature,
      finalCetId: finalCet.txid,
    }
  }

  toConfirmedContract(contract: BroadcastContract): ConfirmedContract {
    return { ...contract, state: ContractState.Confirmed }
  }

  async toRefundedContract(
    contract: ConfirmedContract
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
    contract: InitialContract | OfferedContract | AcceptedContract,
    reason: string
  ): Promise<FailedContract> {
    const states = [ContractState.Offered, ContractState.Accepted] as const
    if (isContractOfState(contract, ...states)) await this.unlockUtxos(contract)
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
    contract: ConfirmedContract | MaturedContract,
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
    contract: MaturedContract,
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
