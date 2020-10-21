import { AdaptorPair } from '../AdaptorPair'
import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'

export interface SignMessage extends DlcTypedMessage {
  readonly messageType: DlcMessageType.Sign
  readonly contractId: string
  readonly fundTxSignatures: ReadonlyArray<string>
  readonly cetAdaptorPairs: ReadonlyArray<AdaptorPair>
  readonly refundSignature: string
  readonly utxoPublicKeys: ReadonlyArray<string>
}
