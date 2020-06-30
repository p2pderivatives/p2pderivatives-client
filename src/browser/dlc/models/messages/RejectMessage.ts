import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'

export interface RejectMessage extends DlcTypedMessage {
  readonly messageType: DlcMessageType.Reject
  readonly contractId: string
}
