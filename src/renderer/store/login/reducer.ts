import { Reducer } from 'redux'
import { LoginState, LoginActionTypes } from './types'

export const initialState: LoginState = {
  loggingIn: false,
  loggingOut: false,
  loggedIn: false,
  error: undefined,
}

const reducer: Reducer<LoginState> = (
  state: LoginState = initialState,
  action
) => {
  switch (action.type) {
    case LoginActionTypes.LOGIN_REQUEST: {
      return { ...state, loggingIn: true }
    }
    case LoginActionTypes.LOGIN_SUCCESS: {
      return { ...state, loggingIn: false, loggedIn: true }
    }
    case LoginActionTypes.LOGIN_ERROR: {
      return {
        ...state,
        loggingIn: false,
        loggedIn: false,
        error: action.payload,
      }
    }
    case LoginActionTypes.LOGOUT_REQUEST: {
      return {
        ...state,
        loggingOut: true,
      }
    }
    case LoginActionTypes.LOGOUT_ERROR: {
      return {
        ...state,
        loggingOut: false,
        error: action.payload,
      }
    }
    case LoginActionTypes.LOGOUT_SUCCESS: {
      return {
        ...state,
        loggingOut: false,
        loggedIn: false,
      }
    }
    case LoginActionTypes.REFRESH_ERROR: {
      return {
        ...state,
        loggedIn: false,
        error: action.payload,
      }
    }
    case LoginActionTypes.REFRESH_SUCCESS: {
      return {
        ...state,
        loggedIn: true,
      }
    }
    default: {
      return state
    }
  }
}

export { reducer as loginReducer }
