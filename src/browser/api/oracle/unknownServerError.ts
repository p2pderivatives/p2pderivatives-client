import { AxiosError } from 'axios'

export class UnknownServerError extends Error {
  constructor(axiosError: AxiosError) {
    super(axiosError.message)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnknownServerError)
    }
    this.name = 'UnknownServerError'
  }
}
