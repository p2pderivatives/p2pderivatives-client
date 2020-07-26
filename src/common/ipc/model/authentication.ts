import { AUTH_ERROR } from '../../constants/Errors'
import { FailableAsync } from '../../utils/failable'
import { ConstrainEvents, ErrorIPC } from '../IPC'

interface AuthIPCError extends ErrorIPC {
  type: typeof AUTH_ERROR
}

export interface ChangePasswordCall {
  readonly oldPassword: string
  readonly newPassword: string
}

export interface LoginCall {
  readonly username: string
  readonly password: string
}

export const AUTH_TAGS = {
  login: 'auth/login',
  logout: 'auth/logout',
  changePassword: 'auth/password/update',
  refresh: 'auth/refresh',
  getUser: 'auth/user/get',
} as const

type TAGS_TYPE = typeof AUTH_TAGS
export type AuthFailableAsync<T> = FailableAsync<T, AuthIPCError>

export interface AuthChannels extends ConstrainEvents<TAGS_TYPE, AuthChannels> {
  login(data: LoginCall): AuthFailableAsync<void>
  logout(): AuthFailableAsync<void>
  changePassword(data: ChangePasswordCall): AuthFailableAsync<void>
  refresh(): AuthFailableAsync<void>
  getUser(): AuthFailableAsync<string>
}

export type AUTH_TAGGED_EVENTS = [TAGS_TYPE, AuthChannels, AuthIPCError]
