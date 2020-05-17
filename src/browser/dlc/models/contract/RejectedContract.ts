import { ContractState } from '../../../../common/models/dlc/ContractState'
import { InitialContract, InitialContractProps } from './InitialContract'

export class RejectedContract extends InitialContract {
  protected constructor(props: InitialContractProps) {
    super(
      props.state,
      props.id,
      props.counterPartyName,
      props.localCollateral,
      props.remoteCollateral,
      props.outcomes,
      props.maturityTime,
      props.feeRate,
      props.oracleInfo,
      props.isLocalParty,
      props.premiumInfo
    )
  }

  static CreateRejectedContract(props: InitialContractProps): RejectedContract {
    return new RejectedContract({ ...props, state: ContractState.Rejected })
  }
}
