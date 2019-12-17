import { LoginRequest, LoginResponse, TokenInfo } from './gen/authentication_pb'
import { Metadata, ServiceError } from 'grpc'
import { promisify } from './grpcPromisify'

const loginFn = (
  request: LoginRequest,
  meta: Metadata,
  callback: (error: ServiceError | null, res: LoginResponse) => void
): any => {
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
  return null
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
