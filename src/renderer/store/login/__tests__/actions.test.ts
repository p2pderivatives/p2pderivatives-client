import { LoginActionTypes } from '../types'
import { action } from 'typesafe-actions'
import { loginRequest, loginError } from '../actions'

describe('login actions', () => {
  it('should create an action to login', () => {
    const expectedAction = action(LoginActionTypes.LOGIN_REQUEST, {
      username: 'test',
      password: 'test',
    })

    expect(loginRequest('test', 'test')).toEqual(expectedAction)
  })

  it('should create a loggin error action', () => {
    const expectedAction = action(LoginActionTypes.LOGIN_ERROR, 'test error')

    expect(loginError('test error')).toEqual(expectedAction)
  })
})
