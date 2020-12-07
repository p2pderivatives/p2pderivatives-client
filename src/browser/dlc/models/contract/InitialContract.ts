import { Contract, ContractState } from '../../../../common/models/dlc/Contract'
import { OracleInfo } from '../../../../common/oracle/oracleInfo'
import { OfferMessage } from '../messages'
import { OracleAnnouncement } from '../oracle/oracleAnnouncement'

export interface InitialContract extends Contract {
  readonly state: ContractState.Initial
  readonly id: string
  readonly oracleInfo: OracleInfo
  readonly oracleAnnouncement: OracleAnnouncement
  readonly isLocalParty: boolean
}

export function fromOfferMessage(
  offerMessage: OfferMessage,
  counterPartyName: string
): InitialContract {
  return {
    state: ContractState.Initial,
    id: offerMessage.contractId,
    counterPartyName,
    localCollateral: offerMessage.localCollateral,
    remoteCollateral: offerMessage.remoteCollateral,
    outcomes: offerMessage.outcomes,
    maturityTime: offerMessage.maturityTime,
    feeRate: offerMessage.feeRate,
    oracleInfo: offerMessage.oracleInfo,
    assetId: offerMessage.assetId,
    oracleAnnouncement: offerMessage.oracleAnnouncement,
    isLocalParty: false,
    premiumAmount: offerMessage.premiumAmount,
  }
}
