import { ContractState } from '../../../../common/models/dlc/ContractState'
import { MaturedContract, MaturedContractProps } from './MaturedContract'

export interface MutualClosedContractProps extends MaturedContractProps {
  readonly mutualCloseTx: string
  readonly mutualCloseTxId: string
  readonly mutualCloseSignature?: string
}

export class MutualClosedContract extends MaturedContract {
  protected constructor(
    props: MaturedContractProps,
    readonly mutualCloseTx: string,
    readonly mutualCloseTxId: string,
    readonly mutualCloseSignature?: string
  ) {
    super(props, props.finalOutcome, props.oracleSignature)
  }

  static CreateMutualClosedContract(
    props: MaturedContractProps,
    mutualCloseTx: string,
    mutualCloseTxId: string,
    mutualCloseSignature?: string
  ): MutualClosedContract {
    return new MutualClosedContract(
      {
        ...props,
        state: ContractState.MutualClosed,
      },
      mutualCloseTx,
      mutualCloseTxId,
      mutualCloseSignature
    )
  }
}
