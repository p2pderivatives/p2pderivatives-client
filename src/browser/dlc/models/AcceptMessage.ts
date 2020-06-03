import { PartyInputs } from './PartyInputs'
import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'

export class AcceptMessage implements DlcTypedMessage {
  readonly messageType: DlcMessageType = DlcMessageType.Accept

  constructor(
    readonly contractId: string,
    readonly remotePartyInputs: PartyInputs,
    readonly cetSignatures: string[],
    readonly refundSignature: string
  ) {}
}
