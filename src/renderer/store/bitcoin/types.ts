import { BitcoinDConfig } from '../../../common/models/ipc/BitcoinDConfig'

export enum BitcoinActionTypes {
  CHECK_REQUEST = '@@bitcoin/CHECK_REQUEST',
  CHECK_SUCCESS = '@@bitcoin/CHECK_SUCCESS',
  CHECK_ERROR = '@@bitcoin/CHECK_ERROR',
  BALANCE_REQUEST = '@@bitcoin/BALANCE_REQUEST',
  BALANCE_SUCCESS = '@@bitcoin/BALANCE_SUCCESS',
  BALANCE_ERROR = '@@bitcoin/BALANCE_ERROR',
  CONFIG_REQUEST = '@@bitcoin/CONFIG_REQUEST',
  CONFIG_RETRIEVED = '@@bitcoin/CONFIG_RETRIEVED',
}

export interface BitcoinState {
  readonly config?: BitcoinDConfig
  readonly checkSuccessful: boolean
  readonly processing: boolean
  readonly balance?: number
  readonly error?: string
}
