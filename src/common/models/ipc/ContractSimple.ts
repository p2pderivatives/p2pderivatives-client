import { Contract } from '../dlc/Contract'
import { ContractState } from '../dlc/ContractState'
import Amount from '../dlc/Amount'
import { Outcome } from '../dlc/Outcome'
import { DateTime } from 'luxon'
import { OracleInfo } from '../dlc/OracleInfo'

export interface OutcomeSimple {
  readonly message: string
  readonly local: number
  readonly remote: number
}

export interface PremiumInfoSimple {
  readonly premiumAmount: number
  readonly localPays: boolean
}

export interface ContractSimple {
  readonly state: ContractState
  readonly id: string
  readonly counterPartyName: string
  readonly localCollateral: number
  readonly remoteCollateral: number
  readonly outcomes: OutcomeSimple[]
  readonly maturityTime: string
  readonly feeRate: number
  readonly premiumInfo?: PremiumInfoSimple
}

export const fromContract = (contract: Contract): ContractSimple => {
  return {
    state: contract.state,
    id: contract.id,
    counterPartyName: contract.counterPartyName,
    localCollateral: contract.localCollateral.GetSatoshiAmount(),
    remoteCollateral: contract.remoteCollateral.GetSatoshiAmount(),
    outcomes: contract.outcomes.map(o => {
      return {
        message: o.message,
        local: o.local.GetSatoshiAmount(),
        remote: o.remote.GetSatoshiAmount(),
      } as OutcomeSimple
    }),
    maturityTime: contract.maturityTime.toISO(),
    feeRate: contract.feeRate,
    premiumInfo: contract.premiumInfo
      ? {
          localPays: contract.premiumInfo.localPays,
          premiumAmount: contract.premiumInfo.premiumAmount.GetSatoshiAmount(),
        }
      : undefined,
  }
}

export const toContract = (
  contract: ContractSimple,
  oracleInfo: OracleInfo
): Contract => {
  return {
    state: contract.state,
    id: contract.id,
    counterPartyName: contract.counterPartyName,
    localCollateral: Amount.FromSatoshis(contract.localCollateral),
    remoteCollateral: Amount.FromSatoshis(contract.remoteCollateral),
    outcomes: contract.outcomes.map(o => {
      return {
        message: o.message,
        local: Amount.FromSatoshis(o.local),
        remote: Amount.FromSatoshis(o.remote),
      } as Outcome
    }),
    maturityTime: DateTime.fromISO(contract.maturityTime, { setZone: true }),
    feeRate: contract.feeRate,
    premiumInfo: contract.premiumInfo
      ? {
          localPays: contract.premiumInfo.localPays,
          premiumAmount: Amount.FromSatoshis(
            contract.premiumInfo.premiumAmount
          ),
        }
      : undefined,
    oracleInfo,
  }
}
