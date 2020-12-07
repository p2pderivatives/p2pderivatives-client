import { OracleInfo } from '../../../../common/oracle/oracleInfo'
import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'
import { PartyInputs } from '../PartyInputs'
import { Outcome } from '../../../../common/models/dlc/Outcome'
import { OracleAnnouncement } from '../oracle/oracleAnnouncement'

export interface OfferMessage extends DlcTypedMessage {
  readonly messageType: DlcMessageType.Offer
  readonly contractId: string
  readonly localCollateral: number
  readonly remoteCollateral: number
  readonly maturityTime: number
  readonly outcomes: ReadonlyArray<Outcome>
  readonly oracleInfo: OracleInfo
  readonly assetId: string
  readonly oracleAnnouncement: OracleAnnouncement
  readonly localPartyInputs: PartyInputs
  readonly feeRate: number
  readonly premiumAmount?: number
}
