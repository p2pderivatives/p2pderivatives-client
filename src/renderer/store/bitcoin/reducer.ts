import { Reducer } from 'redux'
import { BitcoinState, BitcoinActionTypes } from './types'

export const initialState: BitcoinState = {
  config: undefined,
  checkSuccessful: false,
  processing: false,
  balance: undefined,
  error: undefined,
}

export const bitcoinReducer: Reducer<BitcoinState> = (
  state: BitcoinState = initialState,
  action
) => {
  switch (action.type) {
    case BitcoinActionTypes.CHECK_REQUEST: {
      return { ...state, processing: true }
    }
    case BitcoinActionTypes.CHECK_SUCCESS: {
      return { ...state, processing: false, checkSuccessful: true }
    }
    case BitcoinActionTypes.CHECK_ERROR: {
      return {
        ...state,
        processing: false,
        checkSuccessful: false,
        error: action.payload,
      }
    }
    case BitcoinActionTypes.BALANCE_REQUEST: {
      return {
        ...state,
        processing: true,
      }
    }
    case BitcoinActionTypes.BALANCE_SUCCESS: {
      return {
        ...state,
        processing: false,
        balance: action.payload,
      }
    }
    case BitcoinActionTypes.BALANCE_ERROR: {
      return {
        ...state,
        processing: false,
        error: action.payload,
      }
    }
    case BitcoinActionTypes.CONFIG_REQUEST: {
      return {
        ...state,
        processing: true,
      }
    }
    case BitcoinActionTypes.CONFIG_RETRIEVED: {
      return {
        ...state,
        processing: false,
        config: action.payload,
      }
    }
    case BitcoinActionTypes.CONFIG_NONE: {
      return {
        ...state,
        processing: false,
        config: undefined,
      }
    }
    default: {
      return state
    }
  }
}
