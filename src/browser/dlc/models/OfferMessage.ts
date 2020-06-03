import { Outcome } from '../../../common/models/dlc/Outcome'
import { OracleInfo } from '../../../common/models/dlc/OracleInfo'
import { PartyInputs } from './PartyInputs'
import Amount from '../../../common/models/dlc/Amount'
import { PremiumInfo } from '../../../common/models/dlc/PremiumInfo'
import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'
import { DateTime } from 'luxon'

export class OfferMessage implements DlcTypedMessage {
  readonly messageType: DlcMessageType = DlcMessageType.Offer

  constructor(
    readonly contractId: string,
    readonly localCollateral: Amount,
    readonly remoteCollateral: Amount,
    readonly maturityTime: DateTime,
    readonly outcomes: Outcome[],
    readonly oracleInfo: OracleInfo,
    readonly localPartyInputs: PartyInputs,
    readonly feeRate: number,
    readonly premiumInfo?: PremiumInfo
  ) {}
}
