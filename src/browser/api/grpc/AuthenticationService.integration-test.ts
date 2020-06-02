import { Empty } from '@internal/gen-grpc/authentication_pb'
import getMockServer from '../../../../__mocks__/grpcAuthMockServer'
import { GrpcAuth } from './GrpcAuth'
import { GrpcClient } from './GrpcClient'
import { UnsecureGrpcConfig } from './GrpcConfig'
import { GrpcError } from './GrpcError'

const mockServer = getMockServer()
const config: UnsecureGrpcConfig = { host: '127.0.0.1:50051', secure: false }

const auth = new GrpcAuth()
const client = new GrpcClient(config, auth)

describe('authentification-service-integration-tests', () => {
  beforeAll(() => {
    mockServer.listen('0.0.0.0:50051')
  })

  afterAll(() => {
    mockServer.close(true)
  })

  test('grpc-client-login', async () => {
    const loginResponse = await client
      .getAuthenticationService()
      .login('test', 'test')
    expect(loginResponse.getName()).toBe('test')
    expect(loginResponse.getRequireChangePassword()).toBe(false)
    const token = loginResponse.getToken()
    if (token) {
      expect(token.getAccessToken()).toBe('testToken')
    }
  })

  test('grpc-client-refresh', async done => {
    await client.getAuthenticationService().login('test', 'test')
    expect(auth.isExpired()).toBeFalsy()

    setTimeout(async () => {
      expect(auth.isExpired()).toBeTruthy()
      await client.getAuthenticationService().refresh()
      expect(auth.getAuthToken()).toBe('refreshToken')
      expect(auth.getRefreshToken()).toBe('testRefresh')
      expect(auth.isExpired()).toBeFalsy()
      done()
    }, 2000)
  })

  test('grpc-client-logout', async () => {
    const logoutResponse = await client.getAuthenticationService().logout()
    expect(logoutResponse).toBeInstanceOf(Empty)
  })

  test('grpc-client-login-fail', async () => {
    await expect(
      client.getAuthenticationService().login('error', 'test')
    ).rejects.toBeInstanceOf(GrpcError)
  })
})

test('grpc-update-password', async () => {
  const cpResponse = await client
    .getAuthenticationService()
    .changePassword('old', 'new')
  expect(cpResponse).toBeInstanceOf(Empty)
})

test('grpc-update-password-fail', async () => {
  expect.hasAssertions()
  try {
    await client.getAuthenticationService().changePassword('old', 'old')
  } catch (e) {
    expect(e).toBeInstanceOf(GrpcError)
    expect((e as GrpcError).getCode()).toBe(17)
  }
})
