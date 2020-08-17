/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { action } from 'typesafe-actions'
import { User } from '../../../common/models/user'
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
export const userListRequest = () => action(UserActionTypes.USERLIST_REQUEST)
export const userListSuccess = (users: User[]) =>
  action(UserActionTypes.USERLIST_SUCCESS, users)
export const userListError = (error: string) =>
  action(UserActionTypes.USERLIST_ERROR, error)
