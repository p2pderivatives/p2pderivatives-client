import {
  AuthenticationClient,
  IAuthenticationClient,
} from '@internal/gen-grpc/authentication_grpc_pb'
import { IUserClient, UserClient } from '@internal/gen-grpc/user_grpc_pb'
import * as fs from 'fs'
import * as grpc from 'grpc'
import { AuthenticationService } from './AuthenticationService'
import { GrpcAuth } from './GrpcAuth'
import { GrpcConfig, isSecureGrpcConfig } from './GrpcConfig'
import { GrpcError } from './GrpcError'
import { UserService } from './UserService'

export class GrpcClient {
  private _authService: AuthenticationService
  private _userService: UserService
  private _auth: GrpcAuth

  public constructor(config: GrpcConfig, auth: GrpcAuth) {
    this._auth = auth
    if (isSecureGrpcConfig(config)) {
      if (!fs.existsSync(config.certificatePath)) {
        throw new GrpcError(
          'Bad config!',
          'Did not provide valid certificate path for a secure connection!'
        )
      }
    }
    const authClient = this.createClient<IAuthenticationClient>(
      AuthenticationClient,
      config
    )
    this._authService = new AuthenticationService(authClient, this._auth)
    const userClient = this.createClient<IUserClient>(UserClient, config)
    this._userService = new UserService(userClient, this._auth)
  }

  public getAuthenticationService(): AuthenticationService {
    return this._authService
  }

  public getUserService(): UserService {
    return this._userService
  }

  private createClient<T>(
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
