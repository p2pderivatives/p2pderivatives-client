import { expectSaga } from 'redux-saga-test-plan'
import { getContext } from 'redux-saga/effects'
import {
  AuthChannels,
  AuthFailableAsync,
  ChangePasswordCall,
  LoginCall,
} from '../../../../common/ipc/model/authentication'
import { Success } from '../../../../common/utils/failable'
import {
  changePasswordRequest,
  changePasswordSuccess,
  loginError,
  loginRequest,
  loginSuccess,
  logoutError,
  logoutRequest,
  logoutSuccess,
} from '../actions'
import loginSagas from '../sagas'

let failLogout = false

const mockError = {
  success: false,
  error: {
    type: 'authentication',
    code: -1,
    message: 'test message',
    name: 'test error',
  },
} as const

class MockAuthAPI implements AuthChannels {
  login(data: LoginCall): AuthFailableAsync<void> {
    if (data.username === 'test') {
      return Promise.resolve(Success())
    } else {
      return Promise.resolve(mockError)
    }
  }
  logout(): AuthFailableAsync<void> {
    if (!failLogout) {
      return Promise.resolve(Success())
    } else {
      return Promise.resolve(mockError)
    }
  }
  changePassword(data: ChangePasswordCall): AuthFailableAsync<void> {
    return Promise.resolve(Success())
  }
  refresh(): AuthFailableAsync<void> {
    return Promise.resolve(Success())
  }
  getUser(): AuthFailableAsync<string> {
    return Promise.resolve(Success('John Doe'))
  }
}

describe('login saga', () => {
  const authAPI = new MockAuthAPI()

  it('should handle successfully logging in', () => {
    return expectSaga(loginSagas)
      .provide([[getContext('authAPI'), authAPI]])
      .put(loginSuccess('test'))
      .dispatch(loginRequest('test', 'test'))
      .run()
  })

  it('should handle failed logging in', () => {
    return expectSaga(loginSagas)
      .provide([[getContext('authAPI'), authAPI]])
      .put(loginError(mockError.error.message))
      .dispatch(loginRequest('error', 'test'))
      .run()
  })

  it('should handle successful logout', () => {
    return expectSaga(loginSagas)
      .provide([[getContext('authAPI'), authAPI]])
      .put(logoutSuccess())
      .dispatch(logoutRequest())
      .run()
  })

  it('should handle failed logout', () => {
    failLogout = true
    return expectSaga(loginSagas)
      .provide([[getContext('authAPI'), authAPI]])
      .put(logoutError(mockError.error.message))
      .dispatch(logoutRequest())
      .run()
  })

  it('should handle change password', () => {
    return expectSaga(loginSagas)
      .provide([[getContext('authAPI'), authAPI]])
      .put(changePasswordSuccess())
      .dispatch(changePasswordRequest('new', 'old'))
      .run()
  })
})
