import { RepositoryError } from './RepositoryError'
import { ErrorCode } from './ErrorCode'

export class RepositoryResult<T> {
  private readonly _value?: T
  private readonly _error?: RepositoryError

  constructor(value?: T, error?: RepositoryError) {
    this._value = value
    this._error = error
    if (!this._value && !this._error) {
      throw new RepositoryError(
        ErrorCode.InternalError,
        'Both value and error were undefined'
      )
    }
  }

  getValue(): T {
    if (!this._value || this._error) {
      throw new RepositoryError(
        ErrorCode.InternalError,
        'Repository has error but tried to read value.'
      )
    }

    return this._value
  }

  getError(): RepositoryError | undefined {
    return this._error
  }

  hasError(): boolean {
    return this._error !== undefined
  }
}
