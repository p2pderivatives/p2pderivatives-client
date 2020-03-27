import { BitcoinActionTypes } from '../types'
import { action } from 'typesafe-actions'
import { checkRequest, checkError } from '../actions'

describe('login actions', () => {
  it('should create an action to login', () => {
    const expectedAction = action(BitcoinActionTypes.CHECK_REQUEST, {
      rpcUsername: 'test',
      rpcPassword: 'test',
    })

    expect(checkRequest({ rpcUsername: 'test', rpcPassword: 'test' })).toEqual(
      expectedAction
    )
  })

  it('should create a loggin error action', () => {
    const expectedAction = action(BitcoinActionTypes.CHECK_ERROR, 'check error')

    expect(checkError('check error')).toEqual(expectedAction)
  })
})
