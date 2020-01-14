import { LoginRequest, LoginResponse, TokenInfo } from './gen/authentication_pb'
import { Metadata, ServiceError } from 'grpc'
import { promisify } from './grpcPromisify'
import { GrpcError } from './GrpcError'

class TestError implements ServiceError {
  code?: import('grpc').status | undefined
  metadata?: Metadata | undefined
  details?: string | undefined
  name: string
  message = ''
  stack?: string | undefined

  constructor() {
    this.code = 1
    this.name = 'TestError'
    this.details = 'JustATest'
  }
}

const loginFn = (
  request: LoginRequest,
  meta: Metadata,
  callback: (error: ServiceError | null, res: LoginResponse) => void
): void => {
  if (request.getAccount() === 'test') {
    const res = new LoginResponse()
    res.setAccount('test')
    res.setName('testName')
    res.setRequireChangePassword(false)

    const token = new TokenInfo()
    token.setAccessToken('accessToken')
    token.setExpiresIn(3600)
    token.setRefreshToken('refreshToken')
    res.setToken(token)
    callback(null, res)
  } else {
    callback(new TestError(), new LoginResponse())
  }
}

test('can-promisify-callback-fn', () => {
  const request = new LoginRequest()
  request.setAccount('test')
  request.setPassword('test')

  const loginAsync = promisify(loginFn)
  return loginAsync(request).then(res => {
    expect(res.getAccount()).toBe('test')
    const token = res.getToken()
    if (token) {
      expect(token.getAccessToken()).toBe('accessToken')
    }
  })
})

test('promisify-wraps-service-error', () => {
  const request = new LoginRequest()
  request.setAccount('error')

  const loginAsync = promisify(loginFn)
  return loginAsync(request).catch(err => {
    const grpcError = err as GrpcError
    expect(grpcError).toBeDefined()
    expect(grpcError.getCode()).toBe(1)
    expect(grpcError.getMessage()).toBe('JustATest')
    expect(grpcError.getName()).toBe('TestError')
  })
})
