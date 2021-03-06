import { ContractState } from '../../../common/models/dlc/Contract'
import { DateTime } from 'luxon'

export interface ContractQuery {
  readonly counterPartyName?: string
}

export interface ExtendedContractQuery extends ContractQuery {
  readonly states?: ContractState[]
  readonly maturedBefore?: DateTime
}
