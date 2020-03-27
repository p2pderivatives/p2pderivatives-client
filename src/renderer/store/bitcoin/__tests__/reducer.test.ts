import { initialState, bitcoinReducer } from '../reducer'
import { checkRequest, checkSuccess, checkError } from '../actions'

describe('login reducer', () => {
  it('should return initial state', () => {
    expect(
      bitcoinReducer(initialState, { type: 'no type', payload: null })
    ).toEqual(initialState)
  })

  it('should handle successful login request', () => {
    const requestState = bitcoinReducer(
      initialState,
      checkRequest({ rpcUsername: 'test', rpcPassword: 'test' })
    )
    const successState = bitcoinReducer(requestState, checkSuccess())

    expect(requestState).toEqual({
      ...initialState,
      processing: true,
    })
    expect(successState).toEqual({
      ...initialState,
      processing: false,
      checkSuccessful: true,
    })
  })

  it('should handle failed login request', () => {
    const requestState = bitcoinReducer(
      initialState,
      checkRequest({ rpcUsername: 'test', rpcPassword: 'test' })
    )
    const failState = bitcoinReducer(requestState, checkError('test error'))

    expect(requestState).toEqual({
      ...initialState,
      processing: true,
    })
    expect(failState).toEqual({
      ...initialState,
      processing: false,
      checkSuccessful: false,
      error: 'test error',
    })
  })
})
