import { SignedContract, SignedContractProps } from './SignedContract'
import { Outcome } from '../../../../common/models/dlc/Outcome'
import { ContractState } from '../../../../common/models/dlc/ContractState'

export interface MaturedContractProps extends SignedContractProps {
  readonly finalOutcome: Outcome
  readonly oracleSignature: string
}

export class MaturedContract extends SignedContract
  implements MaturedContractProps {
  protected constructor(
    props: SignedContractProps,
    readonly finalOutcome: Outcome,
    readonly oracleSignature: string
  ) {
    super(
      props,
      props.fundTxSignatures,
      props.localUtxoPublicKeys,
      props.refundLocalSignature,
      props.localCetSignatures
    )
  }

  static CreateMaturedContract(
    props: SignedContractProps,
    finalOutcome: Outcome,
    oracleSignature: string
  ): MaturedContract {
    return new MaturedContract(
      { ...props, state: ContractState.Mature },
      finalOutcome,
      oracleSignature
    )
  }
}
