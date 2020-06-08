import { ContractState } from '../../../../common/models/dlc/ContractState'
import { OracleInfo } from '../../../../common/models/dlc/OracleInfo'
import { PremiumInfo } from '../../../../common/models/dlc/PremiumInfo'
import Amount from '../../../../common/models/dlc/Amount'
import { Outcome } from '../../../../common/models/dlc/Outcome'
import { Contract } from '../../../../common/models/dlc/Contract'
import { OfferMessage } from '../OfferMessage'
import { DateTime } from 'luxon'

export interface InitialContractProps extends Contract {
  readonly oracleInfo: OracleInfo
  readonly isLocalParty: boolean
}

export class InitialContract implements InitialContractProps {
  protected constructor(
    readonly state: ContractState,
    readonly id: string,
    readonly counterPartyName: string,
    readonly localCollateral: Amount,
    readonly remoteCollateral: Amount,
    readonly outcomes: Outcome[],
    readonly maturityTime: DateTime,
    readonly feeRate: number,
    readonly oracleInfo: OracleInfo,
    readonly isLocalParty: boolean,
    readonly premiumInfo?: PremiumInfo
  ) {}

  static CreateInitialContract(
    id: string,
    counterPartyName: string,
    localCollateral: Amount,
    remoteCollateral: Amount,
    outcomes: Outcome[],
    maturityTime: DateTime,
    feeRate: number,
    oracleInfo: OracleInfo,
    isLocalParty: boolean,
    premiumInfo?: PremiumInfo
  ): InitialContract {
    return new InitialContract(
      ContractState.Initial,
      id,
      counterPartyName,
      localCollateral,
      remoteCollateral,
      outcomes,
      maturityTime,
      feeRate,
      oracleInfo,
      isLocalParty,
      premiumInfo
    )
  }

  static FromOfferMessage(
    offerMessage: OfferMessage,
    counterPartyName: string
  ): InitialContract {
    return this.CreateInitialContract(
      offerMessage.contractId,
      counterPartyName,
      Amount.FromSatoshis(offerMessage.localCollateral),
      Amount.FromSatoshis(offerMessage.remoteCollateral),
      offerMessage.outcomes.map(x => {
        return {
          message: x.message,
          local: Amount.FromSatoshis(x.local),
          remote: Amount.FromSatoshis(x.remote),
        }
      }),
      DateTime.fromISO(offerMessage.maturityTime, { setZone: true }),
      offerMessage.feeRate,
      offerMessage.oracleInfo,
      false,
      offerMessage.premiumInfo
    )
  }
}
