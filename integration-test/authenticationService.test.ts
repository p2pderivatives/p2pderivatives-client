import { Empty } from '@internal/gen-grpc/authentication_pb'
import {
  TEST_GRPC_CONFIG,
  TEST_SERVER_CONFIG,
  TEST_UPDATE_PASSWORD_USER,
  TEST_USER,
} from '../services/server/env'
import { GrpcAuth } from '../src/browser/api/grpc/GrpcAuth'
import { GrpcClient } from '../src/browser/api/grpc/GrpcClient'
import { GrpcError } from '../src/browser/api/grpc/GrpcError'

describe('authentification-service', () => {
  describe('grpc-client', () => {
    let auth: GrpcAuth
    let client: GrpcClient
    beforeEach(() => {
      auth = new GrpcAuth()
      client = new GrpcClient(TEST_GRPC_CONFIG, auth)
    })

    it('login-logout', async () => {
      const loginResponse = await client
        .getAuthenticationService()
        .login(TEST_USER.username, TEST_USER.pass)
      expect(loginResponse.getName()).toBe(TEST_USER.name)
      expect(loginResponse.getRequireChangePassword()).toBe(false)
      const token = loginResponse.getToken()
      if (token) {
        expect(token.getAccessToken()).toBeDefined()
      }
      const logoutResponse = await client.getAuthenticationService().logout()
      expect(logoutResponse).toBeInstanceOf(Empty)
    })

    test('login-fail', async () => {
      await expect(
        client.getAuthenticationService().login('error', 'test')
      ).rejects.toBeInstanceOf(GrpcError)
    })

    test('token-refresh', async done => {
      await client
        .getAuthenticationService()
        .login(TEST_USER.username, TEST_USER.pass)
      expect(auth.isExpired()).toBeFalsy()

      setTimeout(async () => {
        expect(auth.isExpired()).toBeTruthy()
        await client.getAuthenticationService().refresh()
        expect(auth.getAuthToken()).toBeDefined()
        expect(auth.getRefreshToken()).toBeDefined()
        expect(auth.isExpired()).toBeFalsy()
        await client.getAuthenticationService().logout()
        done()
      }, TEST_SERVER_CONFIG.expiration + 1000)
    })

    describe('update-password-suite', () => {
      test('update-password', async () => {
        const newValidPass = '0123456B@n'
        await client
          .getAuthenticationService()
          .login(
            TEST_UPDATE_PASSWORD_USER.username,
            TEST_UPDATE_PASSWORD_USER.pass
          )
        await client.getAuthenticationService().refresh()
        const cpResponse = await client
          .getAuthenticationService()
          .changePassword(TEST_UPDATE_PASSWORD_USER.pass, newValidPass)
        expect(cpResponse).toBeInstanceOf(Empty)
      })

      // TODO add feature to Grpc server for this use case
      test.skip('update-password-fail-with-same-password', async () => {
        expect.hasAssertions()
        await client
          .getAuthenticationService()
          .login(TEST_USER.username, TEST_USER.pass)
        try {
          client
            .getAuthenticationService()
            .changePassword(TEST_USER.pass, TEST_USER.pass)
        } catch (e) {
          expect(e).toBeInstanceOf(GrpcError)
          expect((e as GrpcError).getCode()).toBe(17)
        }
        await client.getAuthenticationService().logout()
      })
    })
  })
})
