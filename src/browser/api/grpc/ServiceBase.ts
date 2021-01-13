import grpc from 'grpc'
import { GrpcConfig } from './GrpcConfig'

export abstract class ServiceBase {
  protected createClient<T>(
    clientType: new (s: string, creds: grpc.ChannelCredentials) => T,
    config: GrpcConfig
  ): T {
    if (config.secure) {
      return new clientType(config.host, grpc.credentials.createSsl())
    } else {
      return new clientType(config.host, grpc.credentials.createInsecure())
    }
  }
}
