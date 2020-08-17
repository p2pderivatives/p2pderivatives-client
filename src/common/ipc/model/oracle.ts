import { ORACLE_ERROR } from '../../constants/Errors'
import { FailableAsync } from '../../utils/failable'
import { ConstrainEvents, ErrorIPC } from '../IPC'

export interface OracleConfigAnswer {
  startDate: string
  frequency: string
  range: string
}

interface OracleIPCError extends ErrorIPC {
  type: typeof ORACLE_ERROR
}

export const ORACLE_TAGS = {
  getAssetConfig: 'oracle/asset/config/get',
} as const

type TAGS_TYPE = typeof ORACLE_TAGS
export type OracleFailableAsync<T> = FailableAsync<T, OracleIPCError>

export interface OracleChannels
  extends ConstrainEvents<TAGS_TYPE, OracleChannels> {
  getAssetConfig(data: string): OracleFailableAsync<OracleConfigAnswer>
}

export type ORACLE_TAGGED_EVENTS = [TAGS_TYPE, OracleChannels, OracleIPCError]
