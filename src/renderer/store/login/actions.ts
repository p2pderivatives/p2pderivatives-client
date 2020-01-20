import { action } from 'typesafe-actions'
import { LoginActionTypes } from './types'

export const loginRequest = (username: string, password: string) =>
  action(LoginActionTypes.LOGIN_REQUEST, { username, password })
export const loginSuccess = () => action(LoginActionTypes.LOGIN_SUCCESS)
export const loginError = (error: string) =>
  action(LoginActionTypes.LOGIN_ERROR, error)
export const logoutRequest = () => action(LoginActionTypes.LOGOUT_REQUEST)
export const logoutSuccess = () => action(LoginActionTypes.LOGOUT_SUCCESS)
export const logoutError = (error: string) =>
  action(LoginActionTypes.LOGOUT_ERROR, error)
