import { ContractState } from '../../../../common/models/dlc/ContractState'
import { MaturedContract, MaturedContractProps } from './MaturedContract'

export interface MutualCloseProposedContractProps extends MaturedContractProps {
  readonly mutualCloseTx: string
  readonly mutualCloseTxId: string
  readonly proposeTimeOut: Date
}

export class MutualCloseProposedContract extends MaturedContract {
  protected constructor(
    props: MaturedContractProps,
    readonly mutualCloseTx: string,
    readonly mutualCloseTxId: string,
    readonly proposeTimeOut: Date
  ) {
    super(props, props.finalOutcome)
  }

  static CreateMutualCloseProposedContract(
    props: MaturedContractProps,
    mutualCloseTx: string,
    mutualCloseTxId: string,
    proposeTimeOut: Date
  ): MutualCloseProposedContract {
    return new MutualCloseProposedContract(
      {
        ...props,
        state: ContractState.MutualClosed,
      },
      mutualCloseTx,
      mutualCloseTxId,
      proposeTimeOut
    )
  }
}
