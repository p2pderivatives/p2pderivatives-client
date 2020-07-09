import { ContractState } from '../dlc/ContractState'

export interface GetContractsCall {
  id?: string
  counterPartyName?: string
  state?: ContractState
}
