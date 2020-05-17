import { ContractState } from '../../../common/models/dlc/ContractState'

export interface ContractQuery {
  readonly state?: ContractState
  readonly id?: string
  readonly counterPartyName?: string
}

export interface ExtendedContractQuery extends ContractQuery {
  readonly maturedBefore?: Date
}
