import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'

export interface SignMessage extends DlcTypedMessage {
  readonly messageType: DlcMessageType.Sign
  readonly contractId: string
  readonly fundTxSignatures: ReadonlyArray<string>
  readonly cetSignatures: ReadonlyArray<string>
  readonly refundSignature: string
  readonly utxoPublicKeys: ReadonlyArray<string>
}
