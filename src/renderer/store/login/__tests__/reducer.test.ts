import { initialState, loginReducer } from '../reducer'
import { loginRequest, loginSuccess, loginError } from '../actions'

describe('login reducer', () => {
  it('should return initial state', () => {
    expect(
      loginReducer(initialState, { type: 'no type', payload: null })
    ).toEqual(initialState)
  })

  it('should handle successful login request', () => {
    const requestState = loginReducer(
      initialState,
      loginRequest('test', 'test')
    )
    const successState = loginReducer(requestState, loginSuccess())

    expect(requestState).toEqual({
      ...initialState,
      loggingIn: true,
    })
    expect(successState).toEqual({
      ...initialState,
      loggingIn: false,
      loggedIn: true,
    })
  })

  it('should handle failed login request', () => {
    const requestState = loginReducer(
      initialState,
      loginRequest('test', 'test')
    )
    const failState = loginReducer(requestState, loginError('test error'))

    expect(requestState).toEqual({
      ...initialState,
      loggingIn: true,
    })
    expect(failState).toEqual({
      ...initialState,
      loggingIn: false,
      loggedIn: false,
      error: 'test error',
    })
  })
})
