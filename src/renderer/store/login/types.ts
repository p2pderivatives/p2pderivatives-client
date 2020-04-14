export enum LoginActionTypes {
  LOGIN_REQUEST = '@@login/LOGIN_REQUEST',
  LOGIN_SUCCESS = '@@login/LOGIN_SUCCESS',
  LOGIN_ERROR = '@@login/LOGIN_ERROR',
  LOGOUT_REQUEST = '@@login/LOGOUT_REQUEST',
  LOGOUT_SUCCESS = '@@login/LOGOUT_SUCCESS',
  LOGOUT_ERROR = '@@login/LOGOUT_ERROR',
  REFRESH_REQUEST = '@@login/REFRESH_REQUEST',
  REFRESH_SUCCESS = '@@login/REFRESH_SUCCESS',
  REFRESH_ERROR = '@@login/REFRESH_ERROR',
  CHANGEPW_REQUEST = '@@login/CHANGEPW_REQUEST',
  CHANGEPW_SUCCESS = '@@login/CHANGEPW_SUCCESS',
  CHANGEPW_ERROR = '@@login/CHANGEPW_ERROR',
}

export interface LoginState {
  readonly loggingIn: boolean
  readonly loggingOut: boolean
  readonly loggedIn: boolean
  readonly changingPassword: boolean
  readonly changedPassword: boolean
  readonly error?: string
}
