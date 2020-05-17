import getMockServer from '../../__mocks__/grpcAuthMockServer'
import getUserMockServer from '../../__mocks__/grpcUserMockServer'
import { AuthenticationEvents } from '../../src/browser/ipc/AuthenticationEvents'
import { UserEvents } from '../../src/browser/ipc/UserEvents'
import { FileEvents } from '../../src/browser/ipc/FileEvents'
import { DlcEvents } from '../../src/browser/ipc/DlcEvents'
import { GrpcClient } from '../../src/browser/api/grpc/GrpcClient'
import { GrpcConfig } from '../../src/browser/api/grpc/GrpcConfig'
import { GrpcAuth } from '../../src/browser/api/grpc/GrpcAuth'
import { DlcService } from '../../src/browser/dlc/service/DlcService'
import { ContractRepositoryMock } from '../../__mocks__/contractRepositoryMock'

const mockServer = getMockServer()
const userMockServer = getUserMockServer()

const auth = new GrpcAuth()

const config = new GrpcConfig('127.0.0.1:50055', false)
const client = new GrpcClient(config, auth)
const voidCallback = (): Promise<void> => {
  return Promise.resolve()
}
const authEvents = new AuthenticationEvents(client, voidCallback, voidCallback)
const fileEvents = new FileEvents()
mockServer.listen('0.0.0.0:50055')
authEvents.registerReplies()
fileEvents.registerReplies()

const config2 = new GrpcConfig('127.0.0.1:50056', false)
const client2 = new GrpcClient(config2, auth)
const userEvents = new UserEvents(client2)
userMockServer.listen('0.0.0.0:50056')
userEvents.registerReplies()

const dlcService = new DlcService(new ContractRepositoryMock())
const dlcEvents = new DlcEvents(dlcService)
dlcEvents.registerReplies()
