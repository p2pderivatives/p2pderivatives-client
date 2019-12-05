import { GrpcConfig } from './GrpcConfig'
import grpc from 'grpc'
import fs from 'fs'

export abstract class ServiceBase {
  protected createClient<T>(
    clientType: new (s: string, creds: grpc.ChannelCredentials) => T,
    config: GrpcConfig
  ): T {
    if (config.secure) {
      return new clientType(
        config.host,
        grpc.credentials.createSsl(fs.readFileSync(config.certificatePath))
      )
    } else {
      return new clientType(config.host, grpc.credentials.createInsecure())
    }
  }
}
