import { action } from 'typesafe-actions'
import { FileActionTypes } from './types'
import Outcome from '../../../common/models/ipc/Outcome'

export const outcomeRequest = (path: string) =>
  action(FileActionTypes.OUTCOME_REQUEST, path)
export const outcomeSuccess = (outcomes: Outcome[]) =>
  action(FileActionTypes.OUTCOME_SUCCESS, outcomes)
export const outcomeError = (error: string) =>
  action(FileActionTypes.OUTCOME_ERROR, error)
