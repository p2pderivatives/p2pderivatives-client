import { Reducer } from 'redux'
import { LoginState, LoginActionTypes } from './types'

export const initialState: LoginState = {
  username: '',
  loggingIn: false,
  loggingOut: false,
  loggedIn: false,
  changingPassword: false,
  changedPassword: false,
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
      return {
        ...state,
        loggingIn: false,
        loggedIn: true,
        username: action.payload,
      }
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
    case LoginActionTypes.CHANGEPW_REQUEST: {
      return { ...state, changingPassword: true }
    }
    case LoginActionTypes.CHANGEPW_SUCCESS: {
      return { ...state, changingPassword: false, changedPassword: true }
    }
    case LoginActionTypes.CHANGEPW_ERROR: {
      return {
        ...state,
        changingPassword: false,
        changedPassword: false,
        error: action.payload,
      }
    }
    default: {
      return state
    }
  }
}

export { reducer as loginReducer }
