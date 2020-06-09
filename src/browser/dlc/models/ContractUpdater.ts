import { PartyInputs } from './PartyInputs'
import * as Utils from '../utils/CfdUtils'
import * as cfddlcjs from 'cfd-dlc-js'
import Amount from '../../../common/models/dlc/Amount'
import { Utxo } from './Utxo'
import { InitialContract } from './contract/InitialContract'
import { PrivateParams } from './PrivateParams'
import { OfferedContract } from './contract/OfferedContract'
import { AcceptedContract } from './contract/AcceptedContract'
import { SignedContract } from './contract/SignedContract'
import { BroadcastContract } from './contract/BroadcastContract'
import BitcoinDClient from '../../api/bitcoind'
import { Outcome } from '../../../common/models/dlc/Outcome'
import { MutualClosingMessage } from './MutualClosingMessage'
import { MutualCloseProposedContract } from './contract/MutualCloseProposedContract'
import { DateTime } from 'luxon'
import { MaturedContract } from './contract/MaturedContract'
import { MutualClosedContract } from './contract/MutualClosedContract'
import { UnilateralClosedByOtherContract } from './contract/UnilateralClosedByOtherContract'
import { UnilateralClosedContract } from './contract/UnilateralClosedContract'
import { ConfirmedContract } from './contract/ConfirmedContract'
import { DlcError } from './DlcEventHandler'
import { RefundedContract } from './contract/RefundedContract'

const csvDelay = 144

export class ContractUpdater {
  readonly walletClient: BitcoinDClient
  readonly passphrase: string

  constructor(walletClient: BitcoinDClient, passphrase: string) {
    this.walletClient = walletClient
    this.passphrase = passphrase
  }

  private GetTotalInputAmount(partyInputs: PartyInputs): number {
    return partyInputs.utxos.reduce<number>(
      (prev, cur) => prev + cur.amount.GetSatoshiAmount(),
      0
    )
  }

  private async GetNewPrivateParams(utxos: Utxo[]): Promise<PrivateParams> {
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

  private async GetPartyInputs(
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

  async ToOfferedContract(
    contract: InitialContract,
    localPartyInputs?: PartyInputs
  ): Promise<OfferedContract> {
    const collateral = contract.isLocalParty
      ? contract.localCollateral
      : contract.remoteCollateral
    const utxos = await this.walletClient.getUtxosForAmount(collateral)
    const privateParams = await this.GetNewPrivateParams(utxos)
    localPartyInputs = localPartyInputs
      ? localPartyInputs
      : await this.GetPartyInputs(privateParams, utxos)

    return OfferedContract.CreateOfferedContract(
      contract,
      localPartyInputs,
      privateParams
    )
  }

  async ToAcceptContract(
    contract: OfferedContract,
    remotePartyInputs?: PartyInputs,
    refundRemoteSignature?: string,
    remoteCetSignatures?: string[]
  ): Promise<AcceptedContract> {
    const utxos = await this.walletClient.getUtxosForAmount(
      contract.remoteCollateral
    )
    remotePartyInputs = remotePartyInputs
      ? remotePartyInputs
      : await this.GetPartyInputs(contract.privateParams, utxos)
    const dlcTxRequest: cfddlcjs.CreateDlcTransactionsRequest = {
      outcomes: contract.outcomes.map(outcome => {
        return {
          messages: [outcome.message],
          local: outcome.local.GetSatoshiAmount(),
          remote: outcome.remote.GetSatoshiAmount(),
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
      localInputAmount: this.GetTotalInputAmount(contract.localPartyInputs),
      localCollateralAmount: contract.localCollateral.GetSatoshiAmount(),
      remoteInputAmount: this.GetTotalInputAmount(remotePartyInputs),
      remoteCollateralAmount: contract.remoteCollateral.GetSatoshiAmount(),
      csvDelay: csvDelay,
      localInputs: contract.localPartyInputs.utxos,
      remoteInputs: remotePartyInputs.utxos,
      localChangeAddress: contract.localPartyInputs.changeAddress,
      remoteChangeAddress: remotePartyInputs.changeAddress,
      feeRate: contract.feeRate,
      maturityTime: Math.floor(
        contract.maturityTime.minus({ hours: 2 }).toMillis() / 1000
      ),
      refundLocktime: Math.floor(
        contract.maturityTime.plus({ days: 7 }).toMillis() / 1000
      ),
    }

    const dlcTransactions = cfddlcjs.CreateDlcTransactions(dlcTxRequest)
    const fundTxHex = dlcTransactions.fundTxHex
    const fundTransaction = Utils.decodeRawTransaction(fundTxHex)
    const fundTxId = fundTransaction.txid
    if (fundTransaction.vout == undefined) {
      throw new Error('Unexpected state: fund transaction has no vout.')
    }
    const fundTxOutAmount = Amount.FromSatoshis(
      Number(fundTransaction.vout[0].value)
    )
    const refundTxHex = dlcTransactions.refundTxHex
    const localCetsHex = dlcTransactions.localCetsHex
    const remoteCetsHex = dlcTransactions.remoteCetsHex

    console.log('HAHA')
    console.dir(contract, { depth: 10 })
    console.log(localCetsHex)
    console.log(fundTxId)
    console.log(fundTxOutAmount)
    console.log(remotePartyInputs)
    remoteCetSignatures = remoteCetSignatures
      ? remoteCetSignatures
      : this.GetCetSignatures(
          contract,
          localCetsHex,
          fundTxId,
          fundTxOutAmount,
          remotePartyInputs
        )
    refundRemoteSignature = refundRemoteSignature
      ? refundRemoteSignature
      : this.GetRefundTxSignature(
          contract,
          refundTxHex,
          fundTxId,
          fundTxOutAmount,
          remotePartyInputs
        )

    return AcceptedContract.CreateAcceptedContract(
      contract,
      remotePartyInputs,
      fundTxHex,
      fundTxId,
      fundTxOutAmount,
      refundTxHex,
      refundRemoteSignature,
      localCetsHex,
      remoteCetsHex,
      remoteCetSignatures
    )
  }

  GetCetSignatures(
    contract: OfferedContract,
    cetsHex: string[],
    fundTxId: string,
    fundTxOutAmount: Amount,
    partyInputs: PartyInputs
  ): string[] {
    const cetSignRequest: cfddlcjs.GetRawCetSignaturesRequest = {
      cetsHex: cetsHex,
      privkey: contract.privateParams.fundPrivateKey,
      fundTxId: fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: partyInputs.fundPublicKey,
      fundInputAmount: fundTxOutAmount.GetSatoshiAmount(),
    }

    return cfddlcjs.GetRawCetSignatures(cetSignRequest).hex
  }

  GetRefundTxSignature(
    contract: OfferedContract,
    refundTxHex: string,
    fundTxId: string,
    fundTxOutAmount: Amount,
    partyInputs: PartyInputs
  ): string {
    const refundSignRequest: cfddlcjs.GetRawRefundTxSignatureRequest = {
      refundTxHex: refundTxHex,
      privkey: contract.privateParams.fundPrivateKey,
      fundTxId: fundTxId,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: partyInputs.fundPublicKey,
      fundInputAmount: fundTxOutAmount.GetSatoshiAmount(),
    }

    return cfddlcjs.GetRawRefundTxSignature(refundSignRequest).hex
  }

  GetFundTxSignatures(contract: AcceptedContract): string[] {
    const utxos = contract.isLocalParty
      ? contract.localPartyInputs.utxos
      : contract.remotePartyInputs.utxos
    const fundTxSigs = utxos.map((input, index) => {
      const fundTxSignRequest: cfddlcjs.GetRawFundTxSignatureRequest = {
        fundTxHex: contract.fundTxHex,
        privkey: contract.privateParams.inputPrivateKeys[index],
        prevTxId: input.txid,
        prevVout: input.vout,
        amount: input.amount.GetSatoshiAmount(),
      }

      return cfddlcjs.GetRawFundTxSignature(fundTxSignRequest).hex
    })

    return fundTxSigs
  }

  GetFundTxPubkeys(contract: AcceptedContract): string[] {
    return contract.privateParams.inputPrivateKeys.map(x =>
      Utils.getPubkeyFromPrivkey(x)
    )
  }

  VerifyAcceptedContract(contract: AcceptedContract): boolean {
    const verifyCetSignaturesRequest: cfddlcjs.VerifyCetSignaturesRequest = {
      cetsHex: contract.localCetsHex,
      signatures: contract.cetSignatures,
      localFundPubkey: contract.localPartyInputs.fundPublicKey,
      remoteFundPubkey: contract.remotePartyInputs.fundPublicKey,
      fundTxId: contract.fundTxId,
      fundInputAmount: contract.fundTxOutAmount.GetSatoshiAmount(),
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
      fundInputAmount: contract.fundTxOutAmount.GetSatoshiAmount(),
      verifyRemote: true,
    }

    areSigsValid =
      areSigsValid &&
      cfddlcjs.VerifyRefundTxSignature(verifyRefundSigRequest).valid

    return areSigsValid
  }

  async ToSignedContract(
    contract: AcceptedContract,
    localFundTxSignatures?: string[],
    localFundTxPubkeys?: string[],
    localRefundSignature?: string,
    localCetSignatures?: string[]
  ): Promise<SignedContract> {
    localFundTxSignatures = localFundTxSignatures
      ? localFundTxSignatures
      : this.GetFundTxSignatures(contract)

    localFundTxPubkeys = localFundTxPubkeys
      ? localFundTxPubkeys
      : this.GetFundTxPubkeys(contract)

    localRefundSignature = localRefundSignature
      ? localRefundSignature
      : this.GetRefundTxSignature(
          contract,
          contract.refundTxHex,
          contract.fundTxId,
          contract.fundTxOutAmount,
          contract.localPartyInputs
        )

    localCetSignatures = localCetSignatures
      ? localCetSignatures
      : this.GetCetSignatures(
          contract,
          contract.remoteCetsHex,
          contract.fundTxId,
          contract.fundTxOutAmount,
          contract.localPartyInputs
        )

    return SignedContract.CreateSignedContract(
      contract,
      localFundTxSignatures,
      localFundTxPubkeys,
      localRefundSignature,
      localCetSignatures
    )
  }

  async ToBroadcast(contract: SignedContract): Promise<BroadcastContract> {
    let fundTxHex = contract.fundTxHex

    contract.remotePartyInputs.utxos.forEach((input, i) => {
      const fundSignRequest: cfddlcjs.SignFundTransactionRequest = {
        fundTxHex,
        privkey: contract.privateParams.inputPrivateKeys[i],
        prevTxId: input.txid,
        prevVout: input.vout,
        amount: input.amount.GetSatoshiAmount(),
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

    return BroadcastContract.CreateBroadcastContract(contract)
  }

  async ToMutualClosedProposed(
    contract: MaturedContract,
    outcome: Outcome
  ): Promise<MutualCloseProposedContract> {
    const mutualClosingRequest = {
      localFinalAddress: contract.localPartyInputs.finalAddress,
      remoteFinalAddress: contract.remotePartyInputs.finalAddress,
      localAmount: outcome.local.GetSatoshiAmount(),
      remoteAmount: outcome.remote.GetSatoshiAmount(),
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
      fundInputAmount: contract.fundTxOutAmount.GetSatoshiAmount(),
    }

    const signature = cfddlcjs.GetRawMutualClosingTxSignature(signRequest).hex

    return MutualCloseProposedContract.CreateMutualCloseProposedContract(
      contract,
      mutualClosingTxHex,
      mutualClosingTx.txid,
      signature,
      DateTime.utc().plus({ seconds: 30 })
    )
  }

  async ToMutualClosed(
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
      fundInputAmount: contract.fundTxOutAmount.GetSatoshiAmount(),
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

    console.log('SENDING MUTUAL CLOSE')
    console.log(mutualClosingTx.txid)
    await this.walletClient.sendRawTransaction(mutualClosingTxHex)

    return MutualClosedContract.CreateMutualClosedContract(
      contract,
      mutualClosingTxHex,
      mutualClosingTx.txid,
      mutualClosingMessage.signature
    )
  }

  ToMutualClosedConfirmed(contract: MutualCloseProposedContract) {
    return MutualClosedContract.CreateMutualClosedContract(
      contract,
      contract.mutualCloseTx,
      contract.mutualCloseTxId
    )
  }

  async ToUnilateralClosed(
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
      fundInputAmount: contract.fundTxOutAmount.GetSatoshiAmount(),
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
      amount: outcomeAmount.GetSatoshiAmount(),
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

    return UnilateralClosedContract.CreateUnilateralClosedContract(
      contract,
      cet.txid,
      closingTxHex,
      closingTx.txid
    )
  }

  ToUnilateralClosedByOther(contract: MaturedContract, finalCetTxId: string) {
    return UnilateralClosedByOtherContract.CreateUnilateralClosedByOtherContract(
      contract,
      finalCetTxId
    )
  }

  ToMatureContract(
    contract: ConfirmedContract,
    outcomeValue: string,
    oracleSignature: string
  ) {
    const finalOutcome = contract.outcomes.find(x => x.message == outcomeValue)
    if (!finalOutcome) {
      throw new DlcError(
        "Could not find final outcome in the list of contract's outcomes."
      )
    }
    return MaturedContract.CreateMaturedContract(
      contract,
      finalOutcome,
      oracleSignature
    )
  }

  ToConfirmedContract(contract: BroadcastContract) {
    return ConfirmedContract.CreateConfirmedContract(contract)
  }

  async ToRefundedContract(contract: SignedContract) {
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
    return RefundedContract.CreateRefundedContract(contract)
  }
}
