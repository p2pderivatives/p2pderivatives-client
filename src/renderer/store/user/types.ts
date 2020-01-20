export enum UserActionTypes {
  REGISTRATION_REQUEST = '@@user/REGISTRATION_REQUEST',
  REGISTRATION_SUCCESS = '@@user/REGISTRATION_SUCCESS',
  REGISTRATION_ERROR = '@@user/REGISTRATION_ERROR',
  UNREGISTRATION_REQUEST = '@@user/UNREGISTRATION_REQUEST',
  UNREGISTRATION_SUCCESS = '@@user/UNREGISTRATION_SUCCESS',
  UNREGISTRATION_ERROR = '@@user/UNREGISTRATION_ERROR',
}

export interface UserState {
  readonly isRegistering: boolean
  readonly isRegistered: boolean
  readonly isUnregistering: boolean
  readonly error?: string
}
