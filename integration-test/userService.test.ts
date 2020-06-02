import { Empty, UserInfo } from '@internal/gen-grpc/user_pb'
import {
  DEFAULT_PASS,
  TEST_GRPC_CONFIG,
  TEST_UNREGISTER_USER,
  TEST_UPDATE_PASSWORD_USER,
  TEST_USER,
} from '../services/server/env'
import { GrpcAuth } from '../src/browser/api/grpc/GrpcAuth'
import { GrpcClient } from '../src/browser/api/grpc/GrpcClient'

describe('user-service', () => {
  describe('grpc-client', () => {
    let auth: GrpcAuth
    let client: GrpcClient
    beforeEach(() => {
      auth = new GrpcAuth()
      client = new GrpcClient(TEST_GRPC_CONFIG, auth)
    })
    test('register-new-user', async () => {
      const newUser = {
        username: 'newUser',
        pass: DEFAULT_PASS,
      }
      const registerResponse = await client
        .getUserService()
        .registerUser(newUser.username, newUser.pass)
      expect(registerResponse.getName()).toBe(newUser.username)
      expect(registerResponse.getId()).toBeDefined()
    })

    test('unregister-user', async () => {
      await client
        .getAuthenticationService()
        .login(TEST_UNREGISTER_USER.username, TEST_UNREGISTER_USER.pass)
      const unregisterResponse = await client.getUserService().unregisterUser()
      expect(unregisterResponse).toBeInstanceOf(Empty)
    })

    describe('required logged in user', () => {
      beforeEach(async () => {
        await client
          .getAuthenticationService()
          .login(TEST_USER.username, TEST_USER.pass)
      })
      afterEach(async () => {
        await client.getAuthenticationService().logout()
      })
      test('get-user-list', done => {
        expect.hasAssertions()
        const userStream = client.getUserService().getUserListStream()
        const users: string[] = []

        userStream.on('data', (info: UserInfo) => {
          users.push(info.getName())
        })
        userStream.on('end', () => {
          expect(users).not.toContain(TEST_USER.name)
          expect(users).toContain(TEST_UPDATE_PASSWORD_USER.name)

          done()
        })
        userStream.on('error', (err: Error) => {
          throw new Error('stream error')
        })
      })
    })
  })
})
