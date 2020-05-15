import getMockServer from '../../__mocks__/grpcAuthMockServer'
import getUserMockServer from '../../__mocks__/grpcUserMockServer'
import { AuthenticationEvents } from '../../src/browser/ipc/AuthenticationEvents'
import { UserEvents } from '../../src/browser/ipc/UserEvents'
import { FileEvents } from '../../src/browser/ipc/FileEvents'
import { DlcEvents } from '../../src/browser/ipc/DlcEvents'
import { GrpcClient } from '../../src/browser/api/grpc/GrpcClient'
import { GrpcConfig } from '../../src/browser/api/grpc/GrpcConfig'
import { GrpcAuth } from '../../src/browser/api/grpc/GrpcAuth'

const mockServer = getMockServer()
const userMockServer = getUserMockServer()

const auth = new GrpcAuth()

const config = new GrpcConfig('127.0.0.1:50055', false)
const client = new GrpcClient(config, auth)
const authEvents = new AuthenticationEvents(client)
const fileEvents = new FileEvents()
mockServer.listen('0.0.0.0:50055')
authEvents.registerReplies()
fileEvents.registerReplies()

const config2 = new GrpcConfig('127.0.0.1:50056', false)
const client2 = new GrpcClient(config2, auth)
const userEvents = new UserEvents(client2)
userMockServer.listen('0.0.0.0:50056')
userEvents.registerReplies()

const dlcEvents = new DlcEvents()
dlcEvents.registerReplies()
