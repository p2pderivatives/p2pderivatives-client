import Outcome from '../../../common/models/ipc/Outcome'

export enum FileActionTypes {
  OUTCOME_REQUEST = '@@file/OUTCOME_REQUEST',
  OUTCOME_SUCCESS = '@@bitcoin/OUTCOME_SUCCESS',
  OUTCOME_ERROR = '@@bitcoin/OUTCOME_ERROR',
}

export interface FileState {
  readonly parsedOutcomes: Outcome[]
  readonly parsed: boolean
  readonly processing: boolean
  readonly error?: string
}
