import * as cfddlcjs from 'cfd-dlc-js'
import { CfdError, DecodeRawTransactionResponse } from 'cfd-js'
import { ContractState } from '../../../common/models/dlc/Contract'
import {
  isEnumerationOutcome,
  isRangeOutcome,
  Outcome,
} from '../../../common/models/dlc/Outcome'
import BitcoinDClient from '../../api/bitcoind'
import { AdaptorPair } from '../models/AdaptorPair'
import {
  AcceptedContract,
  BroadcastContract,
  ClosedContract,
  ConfirmedContract,
  FailedContract,
  InitialContract,
  isContractOfState,
  MaturedContract,
  OfferedContract,
  PrivateParams,
  RefundedContract,
  RejectedContract,
  SignedContract,
} from '../models/contract'
import { DecompositionDescriptor } from '../models/oracle/decompositionDescriptor'
import {
  EventDescriptor,
  isDecompositionDescriptor,
  isEnumerationDescriptor,
} from '../models/oracle/descriptor'
import { PartyInputs } from '../models/PartyInputs'
import { RangeInfo } from '../models/RangeInfo'
import { Utxo } from '../models/Utxo'
import { groupByIgnoringDigits } from '../utils/Decomposition'
import * as CfdUtils from './CfdUtils'
import * as Utils from './CfdUtils'
import { DigitTrie, trieExplore, trieInsert } from './DigitTrie'
import { DlcError } from './DlcEventHandler'
import { getCommonFee } from './FeeEstimator'
import { getOutcomeIndexes, isDigitTrie } from './OutcomeInfo'

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

  private async getNewPrivateParams(utxos: Utxo[]): Promise<PrivateParams> {
    const fundPrivateKey = await this.walletClient.getNewPrivateKey()
    const inputPrivateKeys = await Promise.all(
      utxos.map(
        async input => await this.walletClient.dumpPrivHex(input.address)
      )
    )

    return {
      fundPrivateKey,
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
    const changeAddress = await this.walletClient.getNewAddress()
    const finalAddress = await this.walletClient.getNewAddress()
    const premiumDest = premiumDestAddress
      ? await this.walletClient.getNewAddress()
      : undefined

    return {
      fundPublicKey,
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

    const payouts: { local: number; remote: number }[] = contract.outcomes.map(
      x => x.payout
    )

    const dlcTransactions = createDlcTransactions(
      payouts,
      contract,
      remotePartyInputs
    )

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

    const descriptor = contract.oracleAnnouncement.oracleEvent.eventDescriptor
    const sigParams = remoteCetAdaptorPairs
      ? undefined
      : {
          fundTxId,
          fundTxOutAmount,
          cetsHex,
          privateParams,
          remotePartyInputs,
        }
    const [outcomeInfo, adaptorPairs] = getOutcomesInfo(
      descriptor,
      contract,
      sigParams
    )

    remoteCetAdaptorPairs = remoteCetAdaptorPairs || adaptorPairs

    if (
      fundTransaction.vout[0].scriptPubKey &&
      fundTransaction.vout[0].scriptPubKey.addresses
    ) {
      await this.walletClient.importAddress(
        fundTransaction.vout[0].scriptPubKey.addresses[0]
      )
    }

    refundRemoteSignature =
      refundRemoteSignature ||
      getRefundTxSignature(
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
      outcomeInfo,
    }
  }

  verifyContractSignatures(
    contract: SignedContract | AcceptedContract
  ): boolean {
    return verifyContractSignatures(contract)
  }

  async toSignedContract(
    contract: AcceptedContract,
    localFundTxSignatures?: ReadonlyArray<string>,
    localFundTxPubkeys?: ReadonlyArray<string>,
    localRefundSignature?: string,
    localCetAdaptorSignatures?: ReadonlyArray<AdaptorPair>
  ): Promise<SignedContract> {
    localFundTxSignatures =
      localFundTxSignatures || getFundTxSignatures(contract)

    localFundTxPubkeys = localFundTxPubkeys || getFundTxPubkeys(contract)

    localRefundSignature =
      localRefundSignature ||
      getRefundTxSignature(
        contract,
        contract.privateParams,
        contract.refundTxHex,
        contract.fundTxId,
        contract.fundTxOutAmount,
        contract.remotePartyInputs
      )

    localCetAdaptorSignatures =
      localCetAdaptorSignatures || getAdaptorSignatures(contract)

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
    const cet = Utils.decodeRawTransaction(
      contract.finalSignedCetHex,
      this.walletClient.getNetwork()
    )

    if (cet.vout === undefined || cet.vout.length === 0) {
      throw new Error('CET has no vout.')
    }

    const finalOutcome = getFinalOutcomeWithDiscardedDust(cet, contract)

    await this.walletClient.sendRawTransaction(contract.finalSignedCetHex)
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

    const finalOutcome = getFinalOutcomeWithDiscardedDust(
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
    oracleSignatures: string[],
    outcomeValues: string[]
  ): MaturedContract {
    try {
      const [cetIndex, adaptorPairIndex, nbUsedSigs] = getOutcomeIndexes(
        contract.outcomeInfo,
        outcomeValues
      )
      // TODO: check this below:
      // Keep track of other party CET if necessary to be able to watch it through the
      // bitcoind wallet
      const finalCetHex = contract.cetsHex[cetIndex]
      const finalCet = Utils.decodeRawTransaction(
        finalCetHex,
        this.walletClient.getNetwork()
      )

      const finalAdaptorPair = contract.isLocalParty
        ? contract.remoteCetAdaptorPairs[adaptorPairIndex]
        : contract.localCetAdaptorPairs[adaptorPairIndex]

      const signRequest: cfddlcjs.SignCetRequest = {
        cetHex: finalCetHex,
        fundPrivkey: contract.privateParams.fundPrivateKey,
        fundTxId: contract.fundTxId,
        localFundPubkey: contract.localPartyInputs.fundPublicKey,
        remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
        fundInputAmount: contract.fundTxOutAmount,
        adaptorSignature: finalAdaptorPair.signature,
        oracleSignatures: oracleSignatures.slice(0, nbUsedSigs),
      }

      const finalSignedCetHex = cfddlcjs.SignCet(signRequest).hex

      return {
        ...contract,
        state: ContractState.Mature,
        finalOutcome: contract.outcomes[cetIndex],
        oracleSignatures,
        finalCetId: finalCet.txid,
        finalSignedCetHex,
        outcomeValues,
      }
    } catch (error) {
      throw Error('Unexpected outcome values')
    }
  }

  toConfirmedContract(contract: BroadcastContract): ConfirmedContract {
    return { ...contract, state: ContractState.Confirmed }
  }

  async toRefundedContract(
    contract: ConfirmedContract
  ): Promise<RefundedContract> {
    const signatures =
      contract.localPartyInputs.fundPublicKey <
      contract.remotePartyInputs.fundPublicKey
        ? [contract.refundLocalSignature, contract.refundRemoteSignature]
        : [contract.refundRemoteSignature, contract.refundLocalSignature]
    const reqJson: cfddlcjs.AddSignaturesToRefundTxRequest = {
      refundTxHex: contract.refundTxHex,
      fundTxId: contract.fundTxId,
      signatures,
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
}

function getTotalInputAmount(partyInputs: PartyInputs): number {
  return partyInputs.utxos.reduce<number>((prev, cur) => prev + cur.amount, 0)
}

function getFinalOutcomeWithDiscardedDust(
  tx: DecodeRawTransactionResponse,
  contract: MaturedContract,
  ownTransaction = true
): Outcome {
  const discardedParty = getDustDiscardedParty(tx, contract, ownTransaction)

  switch (discardedParty) {
    case DustDiscardedParty.local:
      return {
        ...contract.finalOutcome,
        payout: {
          local: 0,
          remote: contract.finalOutcome.payout.remote,
        },
      }
    case DustDiscardedParty.remote:
      return {
        ...contract.finalOutcome,
        payout: {
          local: contract.finalOutcome.payout.local,
          remote: 0,
        },
      }
    default:
      return contract.finalOutcome
  }
}

function getDustDiscardedParty(
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

function verifyContractSignatures(
  contract: AcceptedContract | SignedContract
): boolean {
  let verifyRemote = true
  let refundSignature = ''
  let adaptorPairs: ReadonlyArray<AdaptorPair>

  if (isContractOfState(contract, ContractState.Signed)) {
    refundSignature = contract.refundLocalSignature
    adaptorPairs = contract.localCetAdaptorPairs
    verifyRemote = false
  } else {
    refundSignature = contract.refundRemoteSignature
    refundSignature = contract.refundRemoteSignature
    adaptorPairs = contract.remoteCetAdaptorPairs
    verifyRemote = true
  }
  const isValid = verifyCetAdaptorSignatures(
    contract,
    adaptorPairs,
    verifyRemote
  )
  if (!isValid) {
    return false
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

  return cfddlcjs.VerifyRefundTxSignature(verifyRefundSigRequest).valid
}

function getFundTxSignatures(contract: AcceptedContract): string[] {
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

function getFundTxPubkeys(contract: AcceptedContract): string[] {
  return contract.privateParams.inputPrivateKeys.map(x =>
    Utils.getPubkeyFromPrivkey(x)
  )
}

function getRefundTxSignature(
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

function getAdaptorSignature(
  contract: AcceptedContract | OfferedContract | SignedContract,
  privateParams: PrivateParams,
  outcomeValues: string[],
  cetHex: string,
  fundTxId: string,
  fundTxOutAmount: number,
  remotePartyInputs: PartyInputs
): AdaptorPair {
  const cetSignRequest: cfddlcjs.CreateCetAdaptorSignatureRequest = {
    cetHex,
    privkey: privateParams.fundPrivateKey,
    fundTxId,
    localFundPubkey: contract.localPartyInputs.fundPublicKey,
    remoteFundPubkey: remotePartyInputs.fundPublicKey,
    fundInputAmount: fundTxOutAmount,
    oraclePubkey: contract.oracleAnnouncement.oraclePublicKey,
    oracleRValues: contract.oracleAnnouncement.oracleEvent.nonces.slice(
      0,
      outcomeValues.length
    ),
    messages: outcomeValues,
  }
  return cfddlcjs.CreateCetAdaptorSignature(cetSignRequest)
}

function createDlcTransactions(
  payouts: cfddlcjs.PayoutRequest[],
  contract: OfferedContract,
  remotePartyInputs: PartyInputs
): cfddlcjs.CreateDlcTransactionsResponse {
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
    localInputAmount: getTotalInputAmount(contract.localPartyInputs),
    localCollateralAmount: contract.localCollateral,
    remoteInputAmount: getTotalInputAmount(remotePartyInputs),
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
  return cfddlcjs.CreateDlcTransactions(dlcTxRequest)
}

function getDecompositionOutcomeInfo(
  descriptor: DecompositionDescriptor,
  contract: OfferedContract,
  sigParams?: {
    fundTxId: string
    fundTxOutAmount: number
    cetsHex: string[]
    privateParams: PrivateParams
    remotePartyInputs: PartyInputs
  }
): [DigitTrie<RangeInfo>, AdaptorPair[]] {
  const outcomeTrie: DigitTrie<RangeInfo> = { root: { edges: [] } }
  const adaptorPairs: AdaptorPair[] = []
  let adaptorCounter = 0
  for (let i = 0; i < contract.outcomes.length; i++) {
    const outcome = contract.outcomes[i]
    if (!isRangeOutcome(outcome)) {
      throw Error('Invalid outcome type for decomposition event')
    }
    const groups = groupByIgnoringDigits(
      outcome.start,
      outcome.start + outcome.count - 1,
      descriptor.base,
      contract.oracleAnnouncement.oracleEvent.nonces.length
    )
    for (let j = 0; j < groups.length; j++) {
      if (sigParams) {
        const cetHex = sigParams.cetsHex[i]
        const adaptorPair = getAdaptorSignature(
          contract,
          sigParams.privateParams,
          groups[j].map(x => x.toString()),
          cetHex,
          sigParams.fundTxId,
          sigParams.fundTxOutAmount,
          sigParams.remotePartyInputs
        )
        adaptorPairs.push(adaptorPair)
      }
      const rangeInfo: RangeInfo = {
        cetIndex: i,
        adaptorSignatureIndex: adaptorCounter++,
      }
      trieInsert(outcomeTrie, groups[j], rangeInfo)
    }
  }
  return [outcomeTrie, adaptorPairs]
}

function getEnumerationOutcomeInfo(
  contract: OfferedContract,
  sigParams?: {
    fundTxId: string
    fundTxOutAmount: number
    cetsHex: string[]
    privateParams: PrivateParams
    remotePartyInputs: PartyInputs
  }
): [string[], AdaptorPair[]] {
  const adaptorPairs: AdaptorPair[] = []
  const outcomes: string[] = []
  for (let i = 0; i < contract.outcomes.length; i++) {
    const outcome = contract.outcomes[i]
    if (!isEnumerationOutcome(outcome)) {
      throw Error('Invalid outcome type for enumeration event')
    }
    outcomes.push(outcome.outcome)
    if (sigParams) {
      const cetHex = sigParams.cetsHex[i]
      const adaptorPair = getAdaptorSignature(
        contract,
        sigParams.privateParams,
        [outcome.outcome],
        cetHex,
        sigParams.fundTxId,
        sigParams.fundTxOutAmount,
        sigParams.remotePartyInputs
      )
      adaptorPairs.push(adaptorPair)
    }
  }
  return [outcomes, adaptorPairs]
}

function getOutcomesInfo(
  descriptor: EventDescriptor,
  contract: OfferedContract,
  sigParams?: {
    fundTxId: string
    fundTxOutAmount: number
    cetsHex: string[]
    privateParams: PrivateParams
    remotePartyInputs: PartyInputs
  }
): [DigitTrie<RangeInfo> | string[], AdaptorPair[]] {
  if (isEnumerationDescriptor(descriptor)) {
    return getEnumerationOutcomeInfo(contract, sigParams)
  } else if (isDecompositionDescriptor(descriptor)) {
    return getDecompositionOutcomeInfo(descriptor, contract, sigParams)
  } else {
    throw Error('Unsupported descriptor')
  }
}

function getAdaptorSignaturesForDecomposition(
  contract: AcceptedContract,
  trie: DigitTrie<RangeInfo>
): AdaptorPair[] {
  const adaptorSigs = []
  for (const trieVal of trieExplore(trie)) {
    const adaptorPair = getAdaptorSignature(
      contract,
      contract.privateParams,
      trieVal.path.map(x => x.toString()),
      contract.cetsHex[trieVal.data.cetIndex],
      contract.fundTxId,
      contract.fundTxOutAmount,
      contract.remotePartyInputs
    )
    adaptorSigs.push(adaptorPair)
  }
  return adaptorSigs
}

function getAdaptorSignaturesForEnumeration(
  contract: AcceptedContract,
  outcomes: string[]
): AdaptorPair[] {
  return outcomes.map((x, i) =>
    getAdaptorSignature(
      contract,
      contract.privateParams,
      [x],
      contract.cetsHex[i],
      contract.fundTxId,
      contract.fundTxOutAmount,
      contract.remotePartyInputs
    )
  )
}

function getAdaptorSignatures(contract: AcceptedContract): AdaptorPair[] {
  const descriptor = contract.oracleAnnouncement.oracleEvent.eventDescriptor
  if (isEnumerationDescriptor(descriptor)) {
    return getAdaptorSignaturesForEnumeration(contract, descriptor.outcomes)
  } else if (
    isDecompositionDescriptor(descriptor) &&
    isDigitTrie(contract.outcomeInfo)
  ) {
    return getAdaptorSignaturesForDecomposition(contract, contract.outcomeInfo)
  }
  throw Error('Unknown descriptor or invalid state')
}

function verifyCetAdaptorSignaturesForDecomposition(
  contract: AcceptedContract | SignedContract,
  digitTrie: DigitTrie<RangeInfo>,
  adaptorPairs: ReadonlyArray<AdaptorPair>,
  verifyRemote: boolean
): boolean {
  for (const trieVal of trieExplore(digitTrie)) {
    const adaptorPair = adaptorPairs[trieVal.data.adaptorSignatureIndex]
    const isValid = verifyCetAdaptorSignature(
      adaptorPair,
      contract.cetsHex[trieVal.data.cetIndex],
      trieVal.path.map(x => x.toString()),
      contract,
      verifyRemote
    )
    if (!isValid) {
      return false
    }
  }

  return true
}

function verifyCetAdaptorSignaturesForEnumeration(
  contract: AcceptedContract | SignedContract,
  outcomes: string[],
  adaptorPairs: ReadonlyArray<AdaptorPair>,
  verifyRemote: boolean
): boolean {
  return outcomes.every((x, i) =>
    verifyCetAdaptorSignature(
      adaptorPairs[i],
      contract.cetsHex[i],
      [x],
      contract,
      verifyRemote
    )
  )
}

function verifyCetAdaptorSignatures(
  contract: AcceptedContract | SignedContract,
  adaptorPairs: ReadonlyArray<AdaptorPair>,
  verifyRemote: boolean
): boolean {
  const descriptor = contract.oracleAnnouncement.oracleEvent.eventDescriptor
  if (isEnumerationDescriptor(descriptor)) {
    return verifyCetAdaptorSignaturesForEnumeration(
      contract,
      descriptor.outcomes,
      adaptorPairs,
      verifyRemote
    )
  } else if (
    isDecompositionDescriptor(descriptor) &&
    isDigitTrie(contract.outcomeInfo)
  ) {
    return verifyCetAdaptorSignaturesForDecomposition(
      contract,
      contract.outcomeInfo,
      adaptorPairs,
      verifyRemote
    )
  }

  throw Error('Unknown descriptor or invalid state')
}

function verifyCetAdaptorSignature(
  adaptorPair: AdaptorPair,
  cetHex: string,
  messages: string[],
  contract: AcceptedContract | SignedContract,
  verifyRemote: boolean
): boolean {
  const verifyCetSignatureRequest: cfddlcjs.VerifyCetAdaptorSignatureRequest = {
    cetHex: cetHex,
    adaptorSignature: adaptorPair.signature,
    adaptorProof: adaptorPair.proof,
    messages,
    oracleRValues: contract.oracleAnnouncement.oracleEvent.nonces.slice(
      0,
      messages.length
    ),
    oraclePubkey: contract.oracleAnnouncement.oraclePublicKey,
    localFundPubkey: contract.localPartyInputs.fundPublicKey,
    remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
    fundTxId: contract.fundTxId,
    fundInputAmount: contract.fundTxOutAmount,
    verifyRemote,
  }
  return cfddlcjs.VerifyCetAdaptorSignature(verifyCetSignatureRequest).valid
}
