import fs from 'fs'
import grpc from 'grpc'
import { GrpcConfig, isSecureGrpcConfig } from './GrpcConfig'

export abstract class ServiceBase {
  protected createClient<T>(
    clientType: new (s: string, creds: grpc.ChannelCredentials) => T,
    config: GrpcConfig
  ): T {
    if (isSecureGrpcConfig(config)) {
      return new clientType(
        config.host,
        grpc.credentials.createSsl(fs.readFileSync(config.certificatePath))
      )
    } else {
      return new clientType(config.host, grpc.credentials.createInsecure())
    }
  }
}
