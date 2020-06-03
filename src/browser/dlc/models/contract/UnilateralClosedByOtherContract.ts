import { ContractState } from '../../../../common/models/dlc/ContractState'
import { MaturedContractProps, MaturedContract } from './MaturedContract'

export interface UnilateralClosedByOtherContractProps
  extends MaturedContractProps {
  readonly finalCetTxId: string
}

export class UnilateralClosedByOtherContract extends MaturedContract {
  protected constructor(
    props: MaturedContractProps,
    readonly finalCetTxId: string
  ) {
    super(props, props.finalOutcome, props.oracleSignature)
  }

  static CreateUnilateralClosedByOtherContract(
    props: MaturedContractProps,
    finalCetTxId: string
  ): UnilateralClosedByOtherContract {
    return new UnilateralClosedByOtherContract(
      { ...props, state: ContractState.UnilateralClosedByOther },
      finalCetTxId
    )
  }
}
