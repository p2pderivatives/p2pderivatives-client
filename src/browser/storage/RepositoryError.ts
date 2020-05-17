import { ErrorCode } from './ErrorCode'

export class RepositoryError extends Error {
  readonly errorCode: ErrorCode

  constructor(errorCode: ErrorCode, message: string) {
    super(message)
    this.errorCode = errorCode
    this.name = 'RepositoryError'
  }
}
