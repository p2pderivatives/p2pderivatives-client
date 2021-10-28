import { IAuthenticationClient } from '@internal/gen-grpc/authentication_grpc_pb'
import {
  Empty,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshRequest,
  RefreshResponse,
  UpdatePasswordRequest,
} from '@internal/gen-grpc/authentication_pb'
import { Metadata } from '@grpc/grpc-js'
import AuthenticationError from './AuthenticationError'
import { GrpcAuth } from './GrpcAuth'
import { GrpcError } from './GrpcError'
import { promisify } from './grpcPromisify'

export class AuthenticationService {
  private _client: IAuthenticationClient
  private _auth: GrpcAuth

  public constructor(client: IAuthenticationClient, auth: GrpcAuth) {
    this._client = client
    this._auth = auth
  }

  public login(username: string, password: string): Promise<LoginResponse> {
    const loginRequest: LoginRequest = new LoginRequest()
    loginRequest.setName(username)
    loginRequest.setPassword(password)

    const loginAsync = promisify<LoginRequest, LoginResponse>(
      this._client.login.bind(this._client)
    )
    return loginAsync(loginRequest).then(response => {
      const token = response.getToken()
      if (token) {
        this._auth.setUsername(username)
        this._auth.authorize(
          token.getAccessToken(),
          token.getExpiresIn(),
          token.getRefreshToken()
        )
        return response
      } else {
        throw new GrpcError(
          'Unexpected error',
          'Did not receive a token from successful login request!'
        )
      }
    })
  }

  public logout(): Promise<Empty> {
    const refreshToken = this._auth.getRefreshToken()
    // throw when not filled
    if (!refreshToken) {
      throw new GrpcError('Logout failed!', 'Refresh token has not been set!')
    }

    const logoutRequest = new LogoutRequest()
    logoutRequest.setRefreshToken(refreshToken)

    const metaData = new Metadata()
    metaData.add(GrpcAuth.AuthTokenMeta, this._auth.getAuthToken())

    const logoutAsync = promisify<LogoutRequest, Empty>(
      this._client.logout.bind(this._client)
    )
    return logoutAsync(logoutRequest, metaData).then(response => {
      this._auth.deauthorize()
      return response
    })
  }

  public refresh(): Promise<void> {
    if (!this._auth.isExpired()) {
      return Promise.resolve()
    }

    const refreshToken = this._auth.getRefreshToken()
    // throw when not filled
    if (!refreshToken) {
      throw new AuthenticationError('Refresh failed!')
    }

    const refreshRequest = new RefreshRequest()
    refreshRequest.setRefreshToken(refreshToken)

    const refreshAsync = promisify<RefreshRequest, RefreshResponse>(
      this._client.refresh.bind(this._client)
    )
    return refreshAsync(refreshRequest)
      .then(response => {
        const token = response.getToken()
        if (token) {
          this._auth.authorize(
            token.getAccessToken(),
            token.getExpiresIn(),
            token.getRefreshToken()
          )
        } else {
          throw new AuthenticationError('Unexpected error')
        }
      })
      .catch((e: GrpcError) => {
        throw new AuthenticationError(e.getName())
      })
  }

  public changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<Empty> {
    const cpRequest = new UpdatePasswordRequest()
    cpRequest.setOldPassword(oldPassword)
    cpRequest.setNewPassword(newPassword)

    const metaData = new Metadata()
    metaData.add(GrpcAuth.AuthTokenMeta, this._auth.getAuthToken())
    const changePasswordAsync = promisify<UpdatePasswordRequest, Empty>(
      this._client.updatePassword.bind(this._client)
    )
    return changePasswordAsync(cpRequest, metaData)
  }

  public getGrpcAuth(): GrpcAuth {
    return this._auth
  }
}
