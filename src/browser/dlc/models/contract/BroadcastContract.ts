import { SignedContract, SignedContractProps } from './SignedContract'
import { ContractState } from '../../../../common/models/dlc/ContractState'

export class BroadcastContract extends SignedContract {
  protected constructor(contract: SignedContractProps) {
    super(
      contract,
      contract.fundTxSignatures,
      contract.localUtxoPublicKeys,
      contract.refundLocalSignature,
      contract.localCetSignatures
    )
  }

  static CreateBroadcastContract(
    contract: SignedContractProps
  ): BroadcastContract {
    return new BroadcastContract({
      ...contract,
      state: ContractState.Broadcast,
    })
  }
}
