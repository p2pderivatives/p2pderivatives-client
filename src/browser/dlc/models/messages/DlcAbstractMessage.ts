import { DlcTypedMessage } from './DlcTypedMessage'

export interface DlcAbstractMessage {
  readonly from: string
  readonly payload: DlcTypedMessage
}
