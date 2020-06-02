import { GrpcAuth } from '../../src/browser/api/grpc/GrpcAuth'
import { GrpcClient } from '../../src/browser/api/grpc/GrpcClient'
import { AuthenticationEvents } from '../../src/browser/ipc/AuthenticationEvents'
import { FileEvents } from '../../src/browser/ipc/FileEvents'
import { UserEvents } from '../../src/browser/ipc/UserEvents'
import getMockServer from '../../__mocks__/grpcAuthMockServer'
import getUserMockServer from '../../__mocks__/grpcUserMockServer'

const mockServer = getMockServer()
const userMockServer = getUserMockServer()

const auth = new GrpcAuth()

const client = new GrpcClient({ host: '127.0.0.1:50055', secure: false }, auth)
const authEvents = new AuthenticationEvents(client)
const fileEvents = new FileEvents()
mockServer.listen('0.0.0.0:50055')
authEvents.registerReplies()
fileEvents.registerReplies()

const client2 = new GrpcClient({ host: '127.0.0.1:50056', secure: false }, auth)
const userEvents = new UserEvents(client2)
userMockServer.listen('0.0.0.0:50056')
userEvents.registerReplies()
