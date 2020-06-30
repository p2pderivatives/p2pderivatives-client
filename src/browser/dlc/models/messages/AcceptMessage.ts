import { PartyInputs } from '../PartyInputs'
import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'

export interface AcceptMessage extends DlcTypedMessage {
  readonly messageType: DlcMessageType.Accept
  readonly contractId: string
  readonly remotePartyInputs: PartyInputs
  readonly cetSignatures: ReadonlyArray<string>
  readonly refundSignature: string
}
