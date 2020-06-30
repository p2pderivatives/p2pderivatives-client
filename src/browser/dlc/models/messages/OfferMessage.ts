import { OracleInfo } from '../../../../common/models/dlc/OracleInfo'
import { PremiumInfo } from '../../../../common/models/dlc/PremiumInfo'
import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'
import { PartyInputs } from '../PartyInputs'
import { Outcome } from '../../../../common/models/dlc/Outcome'

export interface OfferMessage extends DlcTypedMessage {
  readonly messageType: DlcMessageType.Offer
  readonly contractId: string
  readonly localCollateral: number
  readonly remoteCollateral: number
  readonly maturityTime: number
  readonly outcomes: ReadonlyArray<Outcome>
  readonly oracleInfo: OracleInfo
  readonly localPartyInputs: PartyInputs
  readonly feeRate: number
  readonly premiumInfo?: PremiumInfo
}
