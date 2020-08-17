import { DlcEventType } from '../../constants/DlcEventType'
import { Contract } from '../../models/dlc/Contract'
import { FailableAsync } from '../../utils/failable'
import { ConstrainEvents, ErrorIPC } from '../IPC'

export interface DlcCall {
  type: DlcEventType
  contractId: string
}

interface UpdateIPCError extends ErrorIPC {
  type: 'update'
  contract?: Contract
}

export const UPDATE_TAGS = {
  updateDlc: 'update/dlc',
} as const

type TAGS_TYPE = typeof UPDATE_TAGS
export type UpdateFailableAsync<T> = FailableAsync<T, UpdateIPCError>

export interface UpdateChannels
  extends ConstrainEvents<TAGS_TYPE, UpdateChannels> {
  updateDlc(data: Contract): UpdateFailableAsync<void>
}

export type UPDATE_TAGGED_EVENTS = [TAGS_TYPE, UpdateChannels, UpdateIPCError]
