import { ContractState } from '../../../../common/models/dlc/ContractState'
import { MaturedContract, MaturedContractProps } from './MaturedContract'

export interface UnilateralClosedContractProps extends MaturedContractProps {
  readonly finalCetTxId: string
  readonly closingTxHex: string
  readonly closingTxId: string
}

export class UnilateralClosedContract extends MaturedContract {
  protected constructor(
    props: MaturedContractProps,
    readonly finalCetTxId: string,
    readonly closingTxHex: string,
    readonly closingTxId: string
  ) {
    super(props, props.finalOutcome, props.oracleSignature)
  }

  static CreateUnilateralClosedContract(
    props: MaturedContractProps,
    finalCetTxId: string,
    closingTxHex: string,
    closingTxId: string
  ): UnilateralClosedContract {
    return new UnilateralClosedContract(
      { ...props, state: ContractState.UnilateralClosed },
      finalCetTxId,
      closingTxHex,
      closingTxId
    )
  }
}
