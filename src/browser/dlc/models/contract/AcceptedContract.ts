import { ContractState } from '../../../../common/models/dlc/Contract'
import { AcceptMessage, DlcMessageType } from '../messages'
import { PartyInputs } from '../PartyInputs'
import { OfferedContract } from './OfferedContract'
import { StatelessContract } from './StatelessContract'
import { PrivateParams } from './PrivateParams'
import { AdaptorPair } from '../AdaptorPair'
import { OutcomeInfo } from '../../utils/OutcomeInfo'

export interface AcceptedContract extends StatelessContract<OfferedContract> {
  readonly state: ContractState.Accepted
  readonly privateParams: PrivateParams
  readonly remotePartyInputs: PartyInputs
  readonly fundTxHex: string
  readonly fundTxId: string
  readonly fundTxOutAmount: number
  readonly refundTxHex: string
  readonly refundRemoteSignature: string
  readonly cetsHex: ReadonlyArray<string>
  readonly remoteCetAdaptorPairs: ReadonlyArray<AdaptorPair>
  readonly outcomeInfo: OutcomeInfo
}

export function toAcceptMessage(contract: AcceptedContract): AcceptMessage {
  return {
    messageType: DlcMessageType.Accept,
    contractId: contract.id,
    remotePartyInputs: contract.remotePartyInputs,
    cetAdaptorPairs: contract.remoteCetAdaptorPairs,
    refundSignature: contract.refundRemoteSignature,
  }
}
