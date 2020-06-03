import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'

export class SignMessage implements DlcTypedMessage {
  readonly messageType: DlcMessageType = DlcMessageType.Sign

  constructor(
    readonly contractId: string,
    readonly fundTxSignatures: string[],
    readonly cetSignatures: string[],
    readonly refundSignature: string,
    readonly utxoPublicKeys: string[]
  ) {}
}
