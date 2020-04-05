import { AuthenticationEvents } from './ipc/AuthenticationEvents'
import { UserEvents } from './ipc/UserEvents'
import { GrpcClient } from './api/grpc/GrpcClient'
import { GrpcConfig } from './api/grpc/GrpcConfig'
import { GrpcAuth } from './api/grpc/GrpcAuth'
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
