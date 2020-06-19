import { Contract } from '../../../../common/models/dlc/Contract'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { StatelessContract } from './StatelessContract'
import { OracleInfo } from '../../../../common/models/dlc/OracleInfo'
import { OfferMessage } from '../messages/OfferMessage'

export interface InitialContract extends StatelessContract<Contract> {
  readonly state: ContractState.Initial
  readonly id: string
  readonly oracleInfo: OracleInfo
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
    isLocalParty: false,
    premiumInfo: offerMessage.premiumInfo,
  }
}
