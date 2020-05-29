/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { action } from 'typesafe-actions'
import { FileActionTypes } from './types'
import { OutcomeSimple } from '../../../common/models/ipc/ContractSimple'

export const outcomeRequest = (path: string) =>
  action(FileActionTypes.OUTCOME_REQUEST, path)
export const outcomeSuccess = (outcomes: OutcomeSimple[]) =>
  action(FileActionTypes.OUTCOME_SUCCESS, outcomes)
export const outcomeError = (error: string) =>
  action(FileActionTypes.OUTCOME_ERROR, error)
