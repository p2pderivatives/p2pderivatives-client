import { Contract } from '../../../common/models/dlc/Contract'

export enum DlcActionTypes {
  CONTRACT_REQUEST = '@@dlc/CONTRACT_REQUEST',
  CONTRACT_SUCCESS = '@@dlc/CONTRACT_SUCCESS',
  CONTRACT_ERROR = '@@dlc/CONTRACT_ERROR',
  OFFER_REQUEST = '@@dlc/OFFER_REQUEST',
  ACCEPT_REQUEST = '@@dlc/ACCEPT_REQUEST',
  REJECT_REQUEST = '@@dlc/REJECT_REQUEST',
  DLC_ACTION_SUCCESS = '@@dlc/ACTION_SUCCESS',
  DLC_ACTION_ERROR = '@@dlc/ACTION_ERROR',
  DLC_UPDATE = '@@dlc/DLC_UPDATE',
  DLC_SELECT = '@@dlc/DLC_RETRY',
}

export interface DlcState {
  readonly contracts: Contract[]
  readonly actionSuccess: boolean
  readonly processing: boolean
  readonly error?: string
  readonly selectedContract?: Contract
}
