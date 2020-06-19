import { InitialContract } from './InitialContract'
import { PartyInputs } from '../PartyInputs'
import { PrivateParams } from './PrivateParams'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { OfferMessage } from '../messages/OfferMessage'
import { DlcMessageType } from '../messages/DlcTypedMessage'
import { StatelessContract } from './StatelessContract'

export interface OfferedContract extends StatelessContract<InitialContract> {
  readonly state: ContractState.Offered
  readonly localPartyInputs: PartyInputs
  readonly privateParams: PrivateParams
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
    premiumInfo: contract.premiumInfo,
  }
}
