import { ContractState } from '../../../../common/models/dlc/Contract'
import { AcceptMessage, DlcMessageType } from '../messages'
import { PartyInputs } from '../PartyInputs'
import { OfferedContract } from './OfferedContract'
import { StatelessContract } from './StatelessContract'
import { PrivateParams } from './PrivateParams'

export interface AcceptedContract extends StatelessContract<OfferedContract> {
  readonly state: ContractState.Accepted
  readonly privateParams: PrivateParams
  readonly remotePartyInputs: PartyInputs
  readonly fundTxHex: string
  readonly fundTxId: string
  readonly fundTxOutAmount: number
  readonly refundTxHex: string
  readonly refundRemoteSignature: string
  readonly localCetsHex: ReadonlyArray<string>
  readonly remoteCetsHex: ReadonlyArray<string>
  readonly remoteCetSignatures: ReadonlyArray<string>
}

export function toAcceptMessage(contract: AcceptedContract): AcceptMessage {
  return {
    messageType: DlcMessageType.Accept,
    contractId: contract.id,
    remotePartyInputs: contract.remotePartyInputs,
    cetSignatures: contract.remoteCetSignatures,
    refundSignature: contract.refundRemoteSignature,
  }
}
