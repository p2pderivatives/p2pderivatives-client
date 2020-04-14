/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { action } from 'typesafe-actions'
import { UserActionTypes } from './types'

export const registerRequest = (username: string, password: string) =>
  action(UserActionTypes.REGISTRATION_REQUEST, { username, password })
export const registerSuccess = () =>
  action(UserActionTypes.REGISTRATION_SUCCESS)
export const registerError = (error: string) =>
  action(UserActionTypes.REGISTRATION_ERROR, error)
export const unregisterRequest = () =>
  action(UserActionTypes.UNREGISTRATION_REQUEST)
export const unregisterSuccess = () =>
  action(UserActionTypes.UNREGISTRATION_SUCCESS)
export const unregisterError = (error: string) =>
  action(UserActionTypes.UNREGISTRATION_ERROR, error)
