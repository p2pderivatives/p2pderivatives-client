import getMockServer from '../../../../__mocks__/grpcUserMockServer'
import { GrpcClient } from './GrpcClient'
import { GrpcConfig } from './GrpcConfig'
import { UserInfo, Empty } from '@internal/gen-grpc/user_pb'
import { GrpcAuth } from './GrpcAuth'

const mockServer = getMockServer()
const config = new GrpcConfig('127.0.0.1:50052', false)
const auth = new GrpcAuth()
const client = new GrpcClient(config, auth)

beforeAll(() => {
  mockServer.listen('0.0.0.0:50052')
})

afterAll(() => {
  mockServer.close(true)
})

test('grpc-client-register-user', async () => {
  const registerResponse = await client
    .getUserService()
    .registerUser('test', 'test')
  expect(registerResponse.getName()).toBe('test')
  expect(registerResponse.getId()).toBe('1')
})

test('grpc-client-unregister-user', async () => {
  const unregisterResponse = await client.getUserService().unregisterUser()
  expect(unregisterResponse).toBeInstanceOf(Empty)
})

test('grpc-client-getuserlist', done => {
  const userStream = client.getUserService().getUserListStream()
  const users: string[] = []

  userStream.on('data', (info: UserInfo) => {
    users.push(info.getName())
  })
  userStream.on('end', () => {
    expect(users).toEqual(['user1', 'user2', 'user3', 'user4'])
    done()
  })
  userStream.on('error', (err: Error) => {
    throw new Error('shouldnt fail')
  })
})
