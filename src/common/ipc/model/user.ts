import { AUTH_ERROR, USER_ERROR } from '../../constants/Errors'
import { User } from '../../models/user'
import { FailableAsync } from '../../utils/failable'
import { ConstrainEvents, ErrorIPC } from '../IPC'

interface UserIPCError extends ErrorIPC {
  // can also be an auth error, see `renderer/store/user/saga.ts`
  type: typeof USER_ERROR | typeof AUTH_ERROR
}

export interface RegisterUserCall {
  readonly username: string
  readonly password: string
}

export interface RegisterUserAnswer {
  id: string
  name: string
}

export const USER_TAGS = {
  register: 'user/register',
  unregister: 'user/unregister',
  getAllUsers: 'user/list/get',
} as const

type TAGS_TYPE = typeof USER_TAGS
export type UserFailableAsync<T> = FailableAsync<T, UserIPCError>

export interface UserChannels extends ConstrainEvents<TAGS_TYPE, UserChannels> {
  register(data: RegisterUserCall): UserFailableAsync<RegisterUserAnswer>
  unregister(): UserFailableAsync<void>
  getAllUsers(): UserFailableAsync<User[]>
}

export type USER_TAGGED_EVENTS = [TAGS_TYPE, UserChannels, UserIPCError]
