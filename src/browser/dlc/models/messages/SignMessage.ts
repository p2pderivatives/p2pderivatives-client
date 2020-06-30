import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'

export interface SignMessage extends DlcTypedMessage {
  readonly messageType: DlcMessageType.Sign
  readonly contractId: string
  readonly fundTxSignatures: string[]
  readonly cetSignatures: string[]
  readonly refundSignature: string
  readonly utxoPublicKeys: string[]
}
