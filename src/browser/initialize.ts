import { AuthenticationEvents } from '../../src/browser/ipc/AuthenticationEvents'
import { UserEvents } from '../../src/browser/ipc/UserEvents'
import { GrpcClient } from '../../src/browser/api/grpc/GrpcClient'
import { GrpcConfig } from '../../src/browser/api/grpc/GrpcConfig'
import { GrpcAuth } from '../../src/browser/api/grpc/GrpcAuth'
import { BitcoinDEvents } from './ipc/BitcoinDEvents'
import FileStorage from './storage/fileStorage'

const initialize = async (): Promise<void> => {
  const auth = new GrpcAuth()
  const config = GrpcConfig.fromConfigOrDefault('./settings.yaml')

  const client = new GrpcClient(config, auth)

  const authEvents = new AuthenticationEvents(client)
  authEvents.registerReplies()

  const userEvents = new UserEvents(client)
  userEvents.registerReplies()

  const bitcoinEvents = new BitcoinDEvents(new FileStorage())
  bitcoinEvents.registerReplies()
}

export default initialize
