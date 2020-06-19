import * as cfddlcjs from 'cfd-dlc-js'
import { DateTime } from 'luxon'
import { ContractState } from '../../../common/models/dlc/ContractState'
import { Outcome } from '../../../common/models/dlc/Outcome'
import BitcoinDClient from '../../api/bitcoind'
import * as Utils from '../utils/CfdUtils'
import {
  AcceptedContract,
  BroadcastContract,
  ConfirmedContract,
  InitialContract,
  MaturedContract,
  MutualClosedContract,
  MutualCloseProposedContract,
  OfferedContract,
  PrivateParams,
  RefundedContract,
  SignedContract,
  UnilateralClosedContract,
} from './contract'
import { DlcError } from './DlcEventHandler'
import { MutualClosingMessage } from './messages'
import { PartyInputs } from './PartyInputs'
import { Utxo } from './Utxo'

const csvDelay = 144

export class ContractUpdater {
  readonly walletClient: BitcoinDClient
  readonly passphrase: string

  constructor(walletClient: BitcoinDClient, passphrase: string) {
    this.walletClient = walletClient
    this.passphrase = passphrase
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
    const utxos = await this.walletClient.getUtxosForAmount(collateral)
    const privateParams = await this.getNewPrivateParams(utxos)
    localPartyInputs = localPartyInputs
      ? localPartyInputs
      : await this.getPartyInputs(privateParams, utxos)

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
    const utxos = await this.walletClient.getUtxosForAmount(
      contract.remoteCollateral
    )
    remotePartyInputs = remotePartyInputs
      ? remotePartyInputs
      : await this.getPartyInputs(contract.privateParams, utxos)
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

    console.dir(dlcTxRequest, { depth: 10 })

    const dlcTransactions = cfddlcjs.CreateDlcTransactions(dlcTxRequest)
    const fundTxHex = dlcTransactions.fundTxHex
    const fundTransaction = Utils.decodeRawTransaction(fundTxHex)
    const fundTxId = fundTransaction.txid
    if (fundTransaction.vout == undefined) {
      throw new Error('Unexpected state: fund transaction has no vout.')
    }
    const fundTxOutAmount = Number(fundTransaction.vout[0].value)
    const refundTxHex = dlcTransactions.refundTxHex
    const localCetsHex = dlcTransactions.localCetsHex
    const remoteCetsHex = dlcTransactions.remoteCetsHex

    remoteCetSignatures = remoteCetSignatures
      ? remoteCetSignatures
      : this.getCetSignatures(
          contract,
          localCetsHex,
          fundTxId,
          fundTxOutAmount,
          remotePartyInputs
        )
    refundRemoteSignature = refundRemoteSignature
      ? refundRemoteSignature
      : this.getRefundTxSignature(
          contract,
          refundTxHex,
          fundTxId,
          fundTxOutAmount,
          remotePartyInputs
        )

    return {
      ...contract,
      state: ContractState.Accepted,
      remotePartyInputs,
      fundTxHex,
      fundTxId,
      fundTxOutAmount,
      refundTxHex,
      refundRemoteSignature,
      localCetsHex,
      remoteCetsHex,
      cetSignatures: remoteCetSignatures,
    }
  }

  getCetSignatures(
    contract: AcceptedContract | OfferedContract | SignedContract,
    cetsHex: ReadonlyArray<string>,
    fundTxId: string,
    fundTxOutAmount: number,
    partyInputs: PartyInputs
  ): string[] {
    const cetSignRequest: cfddlcjs.GetRawCetSignaturesRequest = {
      cetsHex: [...cetsHex],
      privkey: contract.privateParams.fundPrivateKey,
      fundTxId: fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: partyInputs.fundPublicKey,
      fundInputAmount: fundTxOutAmount,
    }

    return cfddlcjs.GetRawCetSignatures(cetSignRequest).hex
  }

  getRefundTxSignature(
    contract: AcceptedContract | OfferedContract,
    refundTxHex: string,
    fundTxId: string,
    fundTxOutAmount: number,
    partyInputs: PartyInputs
  ): string {
    const refundSignRequest: cfddlcjs.GetRawRefundTxSignatureRequest = {
      refundTxHex: refundTxHex,
      privkey: contract.privateParams.fundPrivateKey,
      fundTxId: fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: partyInputs.fundPublicKey,
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

  verifyAcceptedContract(contract: AcceptedContract | SignedContract): boolean {
    const verifyCetSignaturesRequest: cfddlcjs.VerifyCetSignaturesRequest = {
      cetsHex: [...contract.localCetsHex],
      signatures: [...contract.cetSignatures],
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
      fundTxId: contract.fundTxId,
      fundInputAmount: contract.fundTxOutAmount,
      verifyRemote: true,
    }

    let areSigsValid = cfddlcjs.VerifyCetSignatures(verifyCetSignaturesRequest)
      .valid

    const verifyRefundSigRequest: cfddlcjs.VerifyRefundTxSignatureRequest = {
      refundTxHex: contract.refundTxHex,
      signature: contract.refundRemoteSignature,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
      fundTxId: contract.fundTxId,
      fundInputAmount: contract.fundTxOutAmount,
      verifyRemote: true,
    }

    areSigsValid =
      areSigsValid &&
      cfddlcjs.VerifyRefundTxSignature(verifyRefundSigRequest).valid

    return areSigsValid
  }

  async toSignedContract(
    contract: AcceptedContract,
    localFundTxSignatures?: string[],
    localFundTxPubkeys?: string[],
    localRefundSignature?: string,
    localCetSignatures?: string[]
  ): Promise<SignedContract> {
    localFundTxSignatures = localFundTxSignatures
      ? localFundTxSignatures
      : this.getFundTxSignatures(contract)

    localFundTxPubkeys = localFundTxPubkeys
      ? localFundTxPubkeys
      : this.getFundTxPubkeys(contract)

    localRefundSignature = localRefundSignature
      ? localRefundSignature
      : this.getRefundTxSignature(
          contract,
          contract.refundTxHex,
          contract.fundTxId,
          contract.fundTxOutAmount,
          contract.localPartyInputs
        )

    localCetSignatures = localCetSignatures
      ? localCetSignatures
      : this.getCetSignatures(
          contract,
          [...contract.remoteCetsHex],
          contract.fundTxId,
          contract.fundTxOutAmount,
          contract.localPartyInputs
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

    // TODO(tibo: handle transaction sending error
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

    const mutualClosingTx = Utils.decodeRawTransaction(mutualClosingTxHex)

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
      state: ContractState.MutualCloseProposed,
      mutualCloseTx: mutualClosingTxHex,
      mutualCloseTxId: mutualClosingTx.txid,
      ownMutualClosingSignature: signature,
      proposeTimeOut: DateTime.utc()
        .plus({ seconds: 30 })
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

    const mutualClosingTx = Utils.decodeRawTransaction(mutualClosingTxHex)

    await this.walletClient.sendRawTransaction(mutualClosingTxHex)

    return {
      ...contract,
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
      mutualCloseTx: contract.mutualCloseTx,
      mutualCloseTxId: contract.mutualCloseTxId,
    }
  }

  async toUnilateralClosed(
    contract: MaturedContract
  ): Promise<UnilateralClosedContract> {
    const cets = contract.isLocalParty
      ? contract.localCetsHex
      : contract.remoteCetsHex
    const partyInputs = contract.isLocalParty
      ? contract.localPartyInputs
      : contract.remotePartyInputs

    let outcomeIndex = contract.outcomes.findIndex(
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
      ? [cetSign, contract.cetSignatures[outcomeIndex]]
      : [contract.cetSignatures[outcomeIndex], cetSign]

    const addSignRequest: cfddlcjs.AddSignaturesToCetRequest = {
      cetHex,
      signatures,
      fundTxId: contract.fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
    }

    cetHex = cfddlcjs.AddSignaturesToCet(addSignRequest).hex

    const cet = Utils.decodeRawTransaction(cetHex)

    if (cet.vout === undefined) {
      throw new Error('CET has no vout.')
    }

    const outcomeAmount = contract.isLocalParty
      ? contract.outcomes[outcomeIndex].local
      : contract.outcomes[outcomeIndex].remote

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

    const closingTx = Utils.decodeRawTransaction(closingTxHex)

    await this.walletClient.sendRawTransaction(cetHex)
    await this.walletClient.sendRawTransaction(closingTxHex)

    return {
      ...contract,
      state: ContractState.UnilateralClosed,
      finalCetTxId: cet.txid,
      closingTxId: closingTx.txid,
      closingTxHex,
    }
  }

  toUnilateralClosedByOther(contract: MaturedContract, finalCetTxId: string) {
    return {
      ...contract,
      finalCetTxId,
    }
  }

  toMatureContract(
    contract: ConfirmedContract,
    outcomeValue: string,
    oracleSignature: string
  ): MaturedContract {
    const finalOutcome = contract.outcomes.find(x => x.message == outcomeValue)
    if (!finalOutcome) {
      throw new DlcError(
        "Could not find final outcome in the list of contract's outcomes."
      )
    }
    return {
      ...contract,
      state: ContractState.Mature,
      finalOutcome,
      oracleSignature,
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
}
