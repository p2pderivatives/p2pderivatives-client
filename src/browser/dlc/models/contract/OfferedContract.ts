import { ContractState } from '../../../../common/models/dlc/Contract'
import { DlcMessageType, OfferMessage } from '../messages'
import { PartyInputs } from '../PartyInputs'
import { InitialContract } from './InitialContract'
import { PrivateParams } from './PrivateParams'
import { StatelessContract } from './StatelessContract'

export interface OfferedContract extends StatelessContract<InitialContract> {
  readonly state: ContractState.Offered
  readonly localPartyInputs: PartyInputs
  readonly privateParams?: PrivateParams
}

export function toOfferMessage(contract: OfferedContract): OfferMessage {
  return {
    messageType: DlcMessageType.Offer,
    contractId: contract.id,
    localCollateral: contract.localCollateral,
    remoteCollateral: contract.remoteCollateral,
    maturityTime: contract.maturityTime,
    outcomes: contract.outcomes,
    oracleInfo: contract.oracleInfo,
    feeRate: contract.feeRate,
    localPartyInputs: contract.localPartyInputs,
    premiumAmount: contract.premiumAmount,
    assetId: contract.assetId,
    oracleAnnouncement: contract.oracleAnnouncement,
  }
}
