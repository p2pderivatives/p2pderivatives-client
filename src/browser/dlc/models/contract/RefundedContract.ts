import { SignedContractProps, SignedContract } from './SignedContract'
import { ContractState } from '../../../../common/models/dlc/ContractState'

export class RefundedContract extends SignedContract {
  protected constructor(props: SignedContractProps) {
    super(
      props,
      props.fundTxSignatures,
      props.localUtxoPublicKeys,
      props.refundLocalSignature,
      props.localCetSignatures
    )
  }

  static CreateRefundedContract(props: SignedContractProps) {
    return new RefundedContract({
      ...props,
      state: ContractState.Refunded,
    })
  }
}
