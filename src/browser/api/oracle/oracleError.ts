import { AxiosError } from 'axios'

export class OracleError extends Error {
  constructor(axiosError: AxiosError) {
    super(axiosError.message)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OracleError)
    }
    this.name = 'OracleError'
  }
}
