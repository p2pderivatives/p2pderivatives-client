import { expectSaga } from 'redux-saga-test-plan'
import { getContext } from 'redux-saga/effects'
import {
  RegisterUserAnswer,
  RegisterUserCall,
  UserChannels,
  UserFailableAsync,
} from '../../../../common/ipc/model/user'
import { User } from '../../../../common/models/user'
import { Success } from '../../../../common/utils/failable'
import {
  registerError,
  registerRequest,
  registerSuccess,
  unregisterError,
  unregisterRequest,
  unregisterSuccess,
  userListRequest,
  userListSuccess,
} from '../actions'
import userSagas from '../sagas'

let failUnregister = false
const userList = [{ name: 'test1' }, { name: 'test2' }]
const mockError = {
  success: false,
  error: {
    type: 'user',
    code: -1,
    message: 'test message',
    name: 'test error',
  },
} as const
class MockUserAPI implements UserChannels {
  register(data: RegisterUserCall): UserFailableAsync<RegisterUserAnswer> {
    if (data.username === 'test') {
      return Promise.resolve(Success({ name: 'test', id: 'X' }))
    } else {
      return Promise.resolve(mockError)
    }
  }
  unregister(): UserFailableAsync<void> {
    if (!failUnregister) {
      return Promise.resolve(Success())
    } else {
      return Promise.resolve(mockError)
    }
  }
  getAllUsers(): UserFailableAsync<User[]> {
    return Promise.resolve(Success(userList))
  }
}

describe('login saga', () => {
  const userAPI = new MockUserAPI()

  it('should handle successfully registering user', () => {
    return expectSaga(userSagas)
      .provide([[getContext('userAPI'), userAPI]])
      .put(registerSuccess())
      .dispatch(registerRequest('test', 'test'))
      .run()
  })

  it('should handle failed user registration', () => {
    return expectSaga(userSagas)
      .provide([[getContext('userAPI'), userAPI]])
      .put(registerError(mockError.error.message))
      .dispatch(registerRequest('error', 'test'))
      .run()
  })

  it('should handle successful unregistration', () => {
    return expectSaga(userSagas)
      .provide([[getContext('userAPI'), userAPI]])
      .put(unregisterSuccess())
      .dispatch(unregisterRequest())
      .run()
  })

  it('should handle failed logout', () => {
    failUnregister = true
    return expectSaga(userSagas)
      .provide([[getContext('userAPI'), userAPI]])
      .put(unregisterError(mockError.error.message))
      .dispatch(unregisterRequest())
      .run()
  })

  it('should get user list', () => {
    return expectSaga(userSagas)
      .provide([[getContext('userAPI'), userAPI]])
      .put(userListSuccess(userList))
      .dispatch(userListRequest())
      .run()
  })
})
