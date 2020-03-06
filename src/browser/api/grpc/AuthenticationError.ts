import { GrpcError } from './GrpcError'
import { AUTH_ERROR } from '../../../common/constants/Errors'

class AuthenticationError extends GrpcError {
  public constructor(name: string) {
    super(name)
    this._type = AUTH_ERROR
  }
}

export default AuthenticationError
