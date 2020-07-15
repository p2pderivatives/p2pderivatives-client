import { ContractState } from '../dlc/Contract'

export interface GetContractsCall {
  id?: string
  counterPartyName?: string
  state?: ContractState
}
