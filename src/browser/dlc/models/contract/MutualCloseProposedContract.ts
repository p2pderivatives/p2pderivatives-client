import { ContractState } from '../../../../common/models/dlc/ContractState'
import { MaturedContract, MaturedContractProps } from './MaturedContract'
import { DateTime } from 'luxon'
import { MutualClosingMessage } from '../MutualClosingMessage'

export interface MutualCloseProposedContractProps extends MaturedContractProps {
  readonly mutualCloseTx: string
  readonly mutualCloseTxId: string
  readonly ownMutualClosingSignature: string
  readonly proposeTimeOut: DateTime
}

export class MutualCloseProposedContract extends MaturedContract {
  protected constructor(
    props: MaturedContractProps,
    readonly mutualCloseTx: string,
    readonly mutualCloseTxId: string,
    readonly ownMutualClosingSignature: string,
    readonly proposeTimeOut: DateTime
  ) {
    super(props, props.finalOutcome, props.oracleSignature)
  }

  static CreateMutualCloseProposedContract(
    props: MaturedContractProps,
    mutualCloseTx: string,
    mutualCloseTxId: string,
    ownMutualClosingSignature: string,
    proposeTimeOut: DateTime
  ): MutualCloseProposedContract {
    return new MutualCloseProposedContract(
      {
        ...props,
        state: ContractState.MutualCloseProposed,
      },
      mutualCloseTx,
      mutualCloseTxId,
      ownMutualClosingSignature,
      proposeTimeOut
    )
  }

  ToMutualClosingMessage(): MutualClosingMessage {
    return new MutualClosingMessage(
      this.id,
      this.finalOutcome,
      this.ownMutualClosingSignature
    )
  }
}
