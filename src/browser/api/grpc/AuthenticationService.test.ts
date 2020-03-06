/* eslint-disable no-dupe-class-members */

import { IAuthenticationClient } from './gen/authentication_grpc_pb'
import { AuthenticationService } from './AuthenticationService'
import {
  LoginRequest,
  LoginResponse,
  TokenInfo,
  RefreshRequest,
  LogoutRequest,
  RefreshResponse,
  Empty,
} from './gen/authentication_pb'
import grpc, { Metadata, ServiceError } from 'grpc'
import { GrpcAuth } from './GrpcAuth'

const auth = new GrpcAuth()

const loginFn = (
  request: LoginRequest,
  meta: Metadata,
  callback: (error: ServiceError | null, res: LoginResponse) => void
): any => {
  const res = new LoginResponse()
  res.setName('testName')
  res.setRequireChangePassword(false)

  const token = new TokenInfo()
  token.setAccessToken('accessToken')
  token.setExpiresIn(3600)
  token.setRefreshToken('refreshToken')
  res.setToken(token)

  auth.authorize('accessToken', 3600, 'refreshToken')

  callback(null, res)
  return null
}

const refreshFn = (
  request: RefreshRequest,
  meta: Metadata,
  callback: (error: grpc.ServiceError | null, response: RefreshResponse) => void
): any => {
  const res = new RefreshResponse()
  const token = new TokenInfo()
  token.setAccessToken('newAccessToken')
  token.setExpiresIn(3600)
  token.setRefreshToken('refreshToken')
  res.setToken(token)

  auth.authorize('newAccessToken', 3600, 'refreshToken')

  callback(null, res)
  return null
}

const logoutFn = (
  request: LogoutRequest,
  meta: Metadata,
  callback: (error: grpc.ServiceError | null, response: Empty) => void
): any => {
  callback(null, new Empty())
  return null
}

class AuthMock implements IAuthenticationClient {
  login(
    request: LoginRequest,
    callback: (error: grpc.ServiceError | null, response: LoginResponse) => void
  ): grpc.ClientUnaryCall
  login(
    request: LoginRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: LoginResponse) => void
  ): grpc.ClientUnaryCall
  login(
    request: LoginRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: LoginResponse) => void
  ): grpc.ClientUnaryCall
  login(request: any, metadata: any, options?: any, callback?: any) {
    // we only use second signature, which means options == callback, unsure how the generated code does it internally ( type checks? )
    return loginFn(request, metadata, options)
  }
  refresh(
    request: RefreshRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: RefreshResponse
    ) => void
  ): grpc.ClientUnaryCall
  refresh(
    request: RefreshRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: RefreshResponse
    ) => void
  ): grpc.ClientUnaryCall
  refresh(
    request: RefreshRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (
      error: grpc.ServiceError | null,
      response: RefreshResponse
    ) => void
  ): grpc.ClientUnaryCall
  refresh(request: any, metadata: any, options?: any, callback?: any) {
    return refreshFn(request, callback, options)
  }
  logout(
    request: LogoutRequest,
    callback: (error: grpc.ServiceError | null, response: Empty) => void
  ): grpc.ClientUnaryCall
  logout(
    request: LogoutRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: Empty) => void
  ): grpc.ClientUnaryCall
  logout(
    request: LogoutRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: Empty) => void
  ): grpc.ClientUnaryCall
  logout(request: any, metadata: any, options?: any, callback?: any) {
    return logoutFn(request, callback, options)
  }
}

const authClient = new AuthMock()
const authService = new AuthenticationService(authClient, auth)

test('returns-login-response', () => {
  return authService.login('test', 'test').then(response => {
    expect(response.getName()).toBe('testName')
    expect(response.getToken()).toBeDefined()
    const token = response.getToken()
    if (token) {
      expect(token.getAccessToken()).toBe('accessToken')
    }

    expect(auth.getAuthToken()).toBe('accessToken')
    expect(auth.isExpired()).toBe(false)
  })
})

test('returns-refresh-response', () => {
  return authService.refresh().then(response => {
    expect(auth.getAuthToken()).toBe('accessToken')
    expect(auth.isExpired()).toBe(false)
  })
})

test('returns-logout-response', () => {
  return authService.logout().then(response => {
    expect(response).toBeInstanceOf(Empty)

    expect(auth.getAuthToken()).toBe('')
    expect(auth.isExpired()).toBe(true)
  })
})
