import { AuthenticationService } from './AuthenticationService'
import { GrpcConfig } from './GrpcConfig'
import * as grpc from 'grpc'
import {
  IAuthenticationClient,
  AuthenticationClient,
} from './gen/authentication_grpc_pb'
import { UserService } from './UserService'
import { UserClient, IUserClient } from './gen/user_grpc_pb'
import * as fs from 'fs'
import { GrpcAuth } from './GrpcAuth'

export class GrpcClient {
  private _authService: AuthenticationService
  private _userService: UserService
  private _auth: GrpcAuth

  public constructor(config: GrpcConfig, auth: GrpcAuth) {
    this._auth = auth

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
    if (config.secure) {
      return new clientType(
        config.host.toString(),
        grpc.credentials.createSsl(fs.readFileSync(config.certificatePath))
      )
    } else {
      return new clientType(
        config.host.toString(),
        grpc.credentials.createInsecure()
      )
    }
  }
}
