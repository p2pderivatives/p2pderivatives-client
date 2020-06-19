import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'

export class RejectMessage implements DlcTypedMessage {
  readonly messageType: DlcMessageType = DlcMessageType.Reject

  constructor(readonly contractId: string) {}
}
