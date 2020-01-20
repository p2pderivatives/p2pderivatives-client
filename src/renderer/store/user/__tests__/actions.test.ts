import { UserActionTypes } from '../types'
import { action } from 'typesafe-actions'
import { registerRequest, registerError } from '../actions'

describe('user actions', () => {
  it('should create an action to login', () => {
    const expectedAction = action(UserActionTypes.REGISTRATION_REQUEST, {
      username: 'test',
      password: 'test',
    })

    expect(registerRequest('test', 'test')).toEqual(expectedAction)
  })

  it('should create a registration error action', () => {
    const expectedAction = action(
      UserActionTypes.REGISTRATION_ERROR,
      'test error'
    )

    expect(registerError('test error')).toEqual(expectedAction)
  })
})
