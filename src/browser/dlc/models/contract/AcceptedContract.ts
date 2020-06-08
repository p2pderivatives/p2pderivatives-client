import { OfferedContract, OfferedContractProps } from './OfferedContract'
import { PartyInputs } from '../PartyInputs'
import Amount from '../../../../common/models/dlc/Amount'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { AcceptMessage } from '../AcceptMessage'

export interface AcceptedContractProps extends OfferedContractProps {
  readonly remotePartyInputs: PartyInputs
  readonly fundTxHex: string
  readonly fundTxId: string
  readonly fundTxOutAmount: Amount
  readonly refundTxHex: string
  readonly refundRemoteSignature: string
  readonly localCetsHex: string[]
  readonly remoteCetsHex: string[]
  readonly cetSignatures: string[]
}

export class AcceptedContract extends OfferedContract
  implements AcceptedContractProps {
  protected constructor(
    props: OfferedContractProps,
    readonly remotePartyInputs: PartyInputs,
    readonly fundTxHex: string,
    readonly fundTxId: string,
    readonly fundTxOutAmount: Amount,
    readonly refundTxHex: string,
    readonly refundRemoteSignature: string,
    readonly localCetsHex: string[],
    readonly remoteCetsHex: string[],
    readonly cetSignatures: string[]
  ) {
    super(props, props.localPartyInputs, props.privateParams)
  }

  static CreateAcceptedContract(
    props: OfferedContractProps,
    remotePartyInputs: PartyInputs,
    fundTxHex: string,
    fundTxId: string,
    fundTxOutAmount: Amount,
    refundTxHex: string,
    refundRemoteSignature: string,
    localCetsHex: string[],
    remoteCetsHex: string[],
    remoteCetSignatures: string[]
  ): AcceptedContract {
    return new AcceptedContract(
      { ...props, state: ContractState.Accepted },
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

  ToAcceptMessage(): AcceptMessage {
    return new AcceptMessage(
      this.id,
      {
        ...this.remotePartyInputs,
        utxos: this.remotePartyInputs.utxos.map(x => {
          return {
            ...x,
            amount: x.amount.GetSatoshiAmount(),
          }
        }),
      },
      this.cetSignatures,
      this.refundRemoteSignature
    )
  }
}
