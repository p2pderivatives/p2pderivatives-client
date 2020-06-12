import { expectSaga } from 'redux-saga-test-plan'
import loginSagas from '../sagas'
import { AuthenticationAPI } from '../../../ipc/AuthenticationAPI'
import {
  loginSuccess,
  loginRequest,
  loginError,
  logoutSuccess,
  logoutRequest,
  logoutError,
  changePasswordRequest,
  changePasswordSuccess,
} from '../actions'
import { getContext } from 'redux-saga/effects'
import { IPCError } from '../../../../common/models/ipc/IPCError'

let failLogout = false

class MockAuthAPI implements AuthenticationAPI {
  login(username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (username === 'test') {
        resolve()
      } else {
        throw new IPCError('general', -1, 'test error', 'test_error')
        //reject()
      }
    })
  }

  logout(): Promise<void> {
    return new Promise(resolve => {
      if (!failLogout) {
        resolve()
      } else {
        throw new IPCError('general', -1, 'test error', 'test_error')
      }
    })
  }

  refresh(): Promise<void> {
    return Promise.resolve()
  }
  changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return Promise.resolve()
  }

  getUser(): Promise<string> {
    return Promise.resolve('John Doe')
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
      .put(loginError('test error'))
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
      .put(logoutError('test error'))
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
