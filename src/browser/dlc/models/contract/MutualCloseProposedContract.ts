import { MaturedContract } from './MaturedContract'
import { StatelessContract } from './StatelessContract'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { MutualClosingMessage } from '../messages/MutualClosingMessage'
import { DlcMessageType } from '../messages/DlcTypedMessage'

export interface MutualCloseProposedContract
  extends StatelessContract<MaturedContract> {
  readonly state: ContractState.MutualCloseProposed
  readonly mutualCloseTx: string
  readonly mutualCloseTxId: string
  readonly ownMutualClosingSignature: string
  readonly proposeTimeOut: number
}

export function toMutualClosingMessage(
  contract: MutualCloseProposedContract
): MutualClosingMessage {
  return {
    messageType: DlcMessageType.MutualCloseOffer,
    contractId: contract.id,
    outcome: {
      message: contract.finalOutcome.message,
      local: contract.finalOutcome.local,
      remote: contract.finalOutcome.remote,
    },
    signature: contract.ownMutualClosingSignature,
  }
}
