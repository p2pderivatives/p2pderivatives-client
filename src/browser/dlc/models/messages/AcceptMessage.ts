import { AdaptorPair } from '../AdaptorPair'
import { PartyInputs } from '../PartyInputs'
import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'

export interface AcceptMessage extends DlcTypedMessage {
  readonly messageType: DlcMessageType.Accept
  readonly contractId: string
  readonly remotePartyInputs: PartyInputs
  readonly cetAdaptorPairs: ReadonlyArray<AdaptorPair>
  readonly refundSignature: string
}
