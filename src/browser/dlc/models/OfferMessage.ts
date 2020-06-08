import { OracleInfo } from '../../../common/models/dlc/OracleInfo'
import { PartyInputsSimple } from './PartyInputs'
import { PremiumInfo } from '../../../common/models/dlc/PremiumInfo'
import { DlcTypedMessage, DlcMessageType } from './DlcTypedMessage'
import { OutcomeSimple } from '../../../common/models/ipc/ContractSimple'

export class OfferMessage implements DlcTypedMessage {
  readonly messageType: DlcMessageType = DlcMessageType.Offer

  constructor(
    readonly contractId: string,
    readonly localCollateral: number,
    readonly remoteCollateral: number,
    readonly maturityTime: string,
    readonly outcomes: OutcomeSimple[],
    readonly oracleInfo: OracleInfo,
    readonly localPartyInputs: PartyInputsSimple,
    readonly feeRate: number,
    readonly premiumInfo?: PremiumInfo
  ) {}
}
