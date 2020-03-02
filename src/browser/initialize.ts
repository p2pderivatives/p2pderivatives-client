import { AuthenticationEvents } from '../../src/browser/ipc/AuthenticationEvents'
import { UserEvents } from '../../src/browser/ipc/UserEvents'
import { GrpcClient } from '../../src/browser/api/grpc/GrpcClient'
import { GrpcConfig } from '../../src/browser/api/grpc/GrpcConfig'
import { GrpcAuth } from '../../src/browser/api/grpc/GrpcAuth'

const initialize = (): void => {
  const auth = new GrpcAuth()
  const config = GrpcConfig.fromConfigOrDefault('./settings.yaml')
  console.log('config: ', config)

  const client = new GrpcClient(config, auth)

  const authEvents = new AuthenticationEvents(client)
  authEvents.registerReplies()

  const userEvents = new UserEvents(client)
  userEvents.registerReplies()
}

export default initialize
