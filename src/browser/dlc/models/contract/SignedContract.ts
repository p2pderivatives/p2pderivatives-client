import { AcceptedContract, AcceptedContractProps } from './AcceptedContract'
import { ContractState } from '../../../../common/models/dlc/ContractState'

export interface SignedContractProps extends AcceptedContractProps {
  readonly fundTxSignatures: string[]
  readonly localUtxoPublicKeys: string[]
  readonly refundLocalSignature: string
  readonly localCetSignatures: string[]
}

export class SignedContract extends AcceptedContract
  implements SignedContractProps {
  protected constructor(
    props: AcceptedContractProps,
    readonly fundTxSignatures: string[],
    readonly localUtxoPublicKeys: string[],
    readonly refundLocalSignature: string,
    readonly localCetSignatures: string[]
  ) {
    super(
      props,
      props.remotePartyInputs,
      props.fundTxHex,
      props.fundTxId,
      props.fundTxOutAmount,
      props.refundTxHex,
      props.refundRemoteSignature,
      props.localCetsHex,
      props.remoteCetsHex,
      props.cetSignatures
    )
  }

  static CreateSignedContract(
    props: AcceptedContractProps,
    fundTxSignatures: string[],
    utxoPublicKeys: string[],
    localRefundSignature: string,
    localCetSignatures: string[]
  ): SignedContract {
    return new SignedContract(
      { ...props, state: ContractState.Signed },
      fundTxSignatures,
      utxoPublicKeys,
      localRefundSignature,
      localCetSignatures
    )
  }
}
