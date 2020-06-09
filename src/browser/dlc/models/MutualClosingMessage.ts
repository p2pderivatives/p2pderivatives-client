import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'
import { OutcomeSimple } from '../../../common/models/ipc/ContractSimple'

export class MutualClosingMessage implements DlcTypedMessage {
  readonly messageType: DlcMessageType = DlcMessageType.MutualCloseOffer

  constructor(
    readonly contractId: string,
    readonly outcome: OutcomeSimple,
    readonly signature: string
  ) {}
}
