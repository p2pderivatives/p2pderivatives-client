import { initialState, userReducer } from '../reducer'
import { registerRequest, registerSuccess, registerError } from '../actions'

describe('login reducer', () => {
  it('should return initial state', () => {
    expect(
      userReducer(initialState, { type: 'no type', payload: null })
    ).toEqual(initialState)
  })

  it('should handle successful registration request', () => {
    const requestState = userReducer(
      initialState,
      registerRequest('test', 'test')
    )
    const successState = userReducer(requestState, registerSuccess())

    expect(requestState).toEqual({
      ...initialState,
      isRegistering: true,
    })
    expect(successState).toEqual({
      ...initialState,
      isRegistering: false,
      isRegistered: true,
    })
  })

  it('should handle failed registration request', () => {
    const requestState = userReducer(
      initialState,
      registerRequest('test', 'test')
    )
    const failState = userReducer(requestState, registerError('test error'))

    expect(requestState).toEqual({
      ...initialState,
      isRegistering: true,
    })
    expect(failState).toEqual({
      ...initialState,
      isRegistering: false,
      isRegistered: false,
      error: 'test error',
    })
  })
})
