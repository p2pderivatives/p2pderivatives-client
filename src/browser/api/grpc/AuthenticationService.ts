import {
  LoginResponse,
  LoginRequest,
  LogoutRequest,
  RefreshResponse,
  RefreshRequest,
  Empty,
} from './gen/authentication_pb'
import { IAuthenticationClient } from './gen/authentication_grpc_pb'
import { Metadata } from 'grpc'
import { promisify } from './grpcPromisify'
import { GrpcAuth } from './GrpcAuth'
import { GrpcError } from './GrpcError'

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

  public refresh(): Promise<RefreshResponse> {
    const refreshToken = this._auth.getRefreshToken()
    // throw when not filled
    if (!refreshToken) {
      throw new GrpcError('Refresh failed!', 'Refresh token has not been set!')
    }

    const refreshRequest = new RefreshRequest()
    refreshRequest.setRefreshToken(refreshToken)

    const refreshAsync = promisify<RefreshRequest, RefreshResponse>(
      this._client.refresh.bind(this._client)
    )
    return refreshAsync(refreshRequest).then(response => {
      const token = response.getToken()
      if (token) {
        this._auth.authorize(
          token.getAccessToken(),
          token.getExpiresIn(),
          token.getRefreshToken()
        )
        return response
      } else {
        throw new GrpcError(
          'Unexpected error',
          'Did not receive a token from successful refresh request!'
        )
      }
    })
  }
}
