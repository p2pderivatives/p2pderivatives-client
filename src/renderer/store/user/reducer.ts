import { Reducer } from 'redux'
import { UserState, UserActionTypes } from './types'

export const initialState: UserState = {
  isRegistering: false,
  isRegistered: false,
  isUnregistering: false,
  error: undefined,
}

const reducer: Reducer<UserState> = (state = initialState, action) => {
  switch (action.type) {
    case UserActionTypes.REGISTRATION_REQUEST: {
      return { ...state, isRegistering: true }
    }
    case UserActionTypes.REGISTRATION_SUCCESS: {
      return { ...state, isRegistering: false, isRegistered: true }
    }
    case UserActionTypes.REGISTRATION_ERROR: {
      return {
        ...state,
        isRegistering: false,
        isRegistered: false,
        error: action.payload,
      }
    }
    case UserActionTypes.UNREGISTRATION_REQUEST: {
      return {
        ...state,
        isUnregistering: true,
      }
    }
    case UserActionTypes.UNREGISTRATION_SUCCESS: {
      return {
        ...state,
        isUnregistering: false,
        isRegistered: false,
      }
    }
    case UserActionTypes.UNREGISTRATION_ERROR: {
      return {
        ...state,
        isUnregistering: false,
        error: action.payload,
      }
    }
    default: {
      return state
    }
  }
}

export { reducer as userReducer }
