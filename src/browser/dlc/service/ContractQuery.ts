import { ContractState } from '../../../common/models/dlc/ContractState'
import { DateTime } from 'luxon'

export interface ContractQuery {
  readonly state?: ContractState
  readonly counterPartyName?: string
}

export interface ExtendedContractQuery extends ContractQuery {
  readonly states?: ContractState[]
  readonly maturedBefore?: DateTime
}
