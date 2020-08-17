import { FILE_ERROR } from '../../constants/Errors'
import { ContractState } from '../../models/dlc/Contract'
import { Outcome } from '../../models/dlc/Outcome'
import { FailableAsync } from '../../utils/failable'
import { ConstrainEvents, ErrorIPC } from '../IPC'

export interface GetContractsCall {
  id?: string
  counterPartyName?: string
  state?: ContractState
}

interface FileIPCError extends ErrorIPC {
  type: typeof FILE_ERROR
}

export interface OutcomeCall {
  outcomesPath: string
}

export const FILE_TAGS = {
  parseOutcomes: 'file/outcome/parse',
} as const

type TAGS_TYPE = typeof FILE_TAGS
export type FileFailableAsync<T> = FailableAsync<T, FileIPCError>

export interface FileChannels extends ConstrainEvents<TAGS_TYPE, FileChannels> {
  parseOutcomes(data: OutcomeCall): FileFailableAsync<Outcome[]>
}

export type FILE_TAGGED_EVENTS = [TAGS_TYPE, FileChannels, FileIPCError]
