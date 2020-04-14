/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
export const refreshRequest = () => action(LoginActionTypes.REFRESH_REQUEST)
export const refreshSuccess = () => action(LoginActionTypes.REFRESH_SUCCESS)
export const refreshError = (error: string) =>
  action(LoginActionTypes.REFRESH_ERROR, error)
export const changePasswordRequest = (
  oldPassword: string,
  newPassword: string
) => action(LoginActionTypes.CHANGEPW_REQUEST, { oldPassword, newPassword })
export const changePasswordSuccess = () =>
  action(LoginActionTypes.CHANGEPW_SUCCESS)
export const changePasswordError = (error: string) =>
  action(LoginActionTypes.CHANGEPW_ERROR, error)
