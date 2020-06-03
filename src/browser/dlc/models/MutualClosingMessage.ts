import { Outcome } from '../../../common/models/dlc/Outcome'
import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'

export class MutualClosingMessage implements DlcTypedMessage {
  readonly messageType: DlcMessageType = DlcMessageType.MutualCloseOffer

  constructor(
    readonly contractId: string,
    readonly outcome: Outcome,
    readonly signature: string
  ) {}
}
