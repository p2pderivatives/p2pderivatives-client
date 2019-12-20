import getMockServer from '../../../../__mocks__/grpcAuthMockServer'
import { GrpcClient } from './GrpcClient'
import { GrpcConfig } from './GrpcConfig'
import { Empty } from './gen/authentication_pb.js'
import { GrpcAuth } from './GrpcAuth'

const mockServer = getMockServer()
const config = new GrpcConfig('127.0.0.1:50051', false)
const auth = new GrpcAuth()
const client = new GrpcClient(config, auth)

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
  expect(loginResponse.getAccount()).toBe('test')
  expect(loginResponse.getRequireChangePassword()).toBe(false)
  const token = loginResponse.getToken()
  if (token) {
    expect(token.getAccessToken()).toBe('testToken')
  }
})

test('grpc-client-refresh', async () => {
  const refreshResponse = await client.getAuthenticationService().refresh()
  const token = refreshResponse.getToken()
  if (token) {
    expect(token.getAccessToken()).toBe('testToken')
    expect(token.getExpiresIn()).toBe(3600)
  }
})

test('grpc-client-logout', async () => {
  const logoutResponse = await client.getAuthenticationService().logout()
  expect(logoutResponse).toBeInstanceOf(Empty)
})

test('grpc-client-login-fail', async () => {
  await expect(
    client.getAuthenticationService().login('error', 'test')
  ).rejects.toHaveProperty('code', 17)
})
