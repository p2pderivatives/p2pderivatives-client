import { SignedContract, SignedContractProps } from './SignedContract'
import { ContractState } from '../../../../common/models/dlc/ContractState'

export class ConfirmedContract extends SignedContract {
  protected constructor(contract: SignedContractProps) {
    super(
      contract,
      contract.fundTxSignatures,
      contract.localUtxoPublicKeys,
      contract.refundLocalSignature,
      contract.localCetSignatures
    )
  }

  static CreateConfirmedContract(
    contract: SignedContractProps
  ): ConfirmedContract {
    return new ConfirmedContract({
      ...contract,
      state: ContractState.Confirmed,
    })
  }
}
