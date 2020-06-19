/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { action } from 'typesafe-actions'
import { DlcActionTypes } from './types'
import { Contract } from '../../../common/models/dlc/Contract'

export const contractRequest = () => action(DlcActionTypes.CONTRACT_REQUEST)
export const contractSuccess = (contracts: Contract[]) =>
  action(DlcActionTypes.CONTRACT_SUCCESS, contracts)
export const contractError = (error: string) =>
  action(DlcActionTypes.CONTRACT_ERROR, error)
export const offerRequest = (contract: Contract) =>
  action(DlcActionTypes.OFFER_REQUEST, contract)
export const acceptRequest = (contractId: string) =>
  action(DlcActionTypes.ACCEPT_REQUEST, contractId)
export const rejectRequest = (contractId: string) =>
  action(DlcActionTypes.REJECT_REQUEST, contractId)
export const dlcActionSuccess = (contract: Contract) =>
  action(DlcActionTypes.DLC_ACTION_SUCCESS, contract)
export const dlcActionError = (error: { error: string; contract?: Contract }) =>
  action(DlcActionTypes.DLC_ACTION_ERROR, error)
export const dlcUpdate = (contract: Contract) =>
  action(DlcActionTypes.DLC_UPDATE, contract)
export const dlcSelectContract = (contract?: Contract) =>
  action(DlcActionTypes.DLC_SELECT, contract)
