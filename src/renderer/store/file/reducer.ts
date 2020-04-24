import { Reducer } from 'redux'
import { FileState, FileActionTypes } from './types'

export const initialState: FileState = {
  parsedOutcomes: [],
  processing: false,
  parsed: false,
  error: undefined,
}

export const fileReducer: Reducer<FileState> = (
  state: FileState = initialState,
  action
) => {
  switch (action.type) {
    case FileActionTypes.OUTCOME_REQUEST: {
      return { ...state, processing: true, parsed: false }
    }
    case FileActionTypes.OUTCOME_SUCCESS: {
      return {
        ...state,
        processing: false,
        parsed: true,
        parsedOutcomes: action.payload,
      }
    }
    case FileActionTypes.OUTCOME_ERROR: {
      return {
        ...state,
        processing: false,
        parsed: false,
        error: action.payload,
      }
    }
    default: {
      return state
    }
  }
}
