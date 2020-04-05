import { action } from 'typesafe-actions'
import { BitcoinActionTypes } from './types'
import { BitcoinDConfig } from '../../../common/models/ipc/BitcoinDConfig'

export const checkRequest = (config: BitcoinDConfig) =>
  action(BitcoinActionTypes.CHECK_REQUEST, config)
export const checkSuccess = () => action(BitcoinActionTypes.CHECK_SUCCESS)
export const checkError = (error: string) =>
  action(BitcoinActionTypes.CHECK_ERROR, error)
export const balanceRequest = () => action(BitcoinActionTypes.BALANCE_REQUEST)
export const balanceSuccess = (balance: number) =>
  action(BitcoinActionTypes.BALANCE_SUCCESS, balance)
export const balanceError = (error: string) =>
  action(BitcoinActionTypes.BALANCE_ERROR, error)
export const configRequest = () => action(BitcoinActionTypes.CONFIG_REQUEST)
export const configRetrieved = (config: BitcoinDConfig) =>
  action(BitcoinActionTypes.CONFIG_RETRIEVED, config)
