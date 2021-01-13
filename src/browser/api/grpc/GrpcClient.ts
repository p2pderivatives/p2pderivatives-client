import {
  AuthenticationClient,
  IAuthenticationClient,
} from '@internal/gen-grpc/authentication_grpc_pb'
import { IUserClient, UserClient } from '@internal/gen-grpc/user_grpc_pb'
import * as grpc from 'grpc'
import { AuthenticationService } from './AuthenticationService'
import { DlcMessageService } from './DlcMessageService'
import { GrpcAuth } from './GrpcAuth'
import { GrpcConfig } from './GrpcConfig'
import { UserService } from './UserService'

export class GrpcClient {
  private _authService: AuthenticationService
  private _userService: UserService
  private _dlcService: DlcMessageService
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
    this._dlcService = new DlcMessageService(userClient, this._authService)
  }

  public getAuthObject(): GrpcAuth {
    return this._auth
  }

  public getAuthenticationService(): AuthenticationService {
    return this._authService
  }

  public getUserService(): UserService {
    return this._userService
  }

  public getDlcService(): DlcMessageService {
    return this._dlcService
  }

  private createClient<T>(
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
