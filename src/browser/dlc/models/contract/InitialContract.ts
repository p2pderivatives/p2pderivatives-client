import { ContractState } from '../../../../common/models/dlc/ContractState'
import { OracleInfo } from '../../../../common/models/dlc/OracleInfo'
import { PremiumInfo } from '../../../../common/models/dlc/PremiumInfo'
import Amount from '../../../../common/models/dlc/Amount'
import { Outcome } from '../../../../common/models/dlc/Outcome'
import { Contract } from '../../../../common/models/dlc/Contract'

export interface InitialContractProps extends Contract {
  readonly state: ContractState
  readonly id: string
  readonly counterPartyName: string
  readonly localCollateral: Amount
  readonly remoteCollateral: Amount
  readonly outcomes: Outcome[]
  readonly maturityTime: Date
  readonly feeRate: number
  readonly premiumInfo?: PremiumInfo
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
    readonly maturityTime: Date,
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
    maturityTime: Date,
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
}
