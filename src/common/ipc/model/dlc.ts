import { DlcEventType } from '../../constants/DlcEventType'
import { DLC_ERROR } from '../../constants/Errors'
import { Contract } from '../../models/dlc/Contract'
import { FailableAsync } from '../../utils/failable'
import { ConstrainEvents, ErrorIPC } from '../IPC'

export interface DlcCall {
  type: DlcEventType
  contractId: string
}

interface DlcIPCError extends ErrorIPC {
  type: typeof DLC_ERROR
  contract?: Contract
}

export const DLC_TAGS = {
  getAllContracts: 'dlc/contract/get-all',
  offerContract: 'dlc/contract/offer',
  dlcCall: 'dlc/events',
} as const

type TAGS_TYPE = typeof DLC_TAGS
export type DlcFailableAsync<T> = FailableAsync<T, DlcIPCError>

export interface DlcChannels extends ConstrainEvents<TAGS_TYPE, DlcChannels> {
  getAllContracts(): DlcFailableAsync<Contract[]>
  offerContract(data: Contract): DlcFailableAsync<Contract>
  dlcCall(data: DlcCall): DlcFailableAsync<Contract>
}

export type DLC_TAGGED_EVENTS = [TAGS_TYPE, DlcChannels, DlcIPCError]
