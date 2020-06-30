import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'
import { Outcome } from '../../../../common/models/dlc/Outcome'

export interface MutualClosingMessage extends DlcTypedMessage {
  readonly messageType: DlcMessageType.MutualCloseOffer
  readonly contractId: string
  readonly outcome: Outcome
  readonly signature: string
}
