import { ServiceError, Metadata } from 'grpc'

export function promisify<T1, TResult>(
  fn: (
    arg1: T1,
    arg2: Metadata,
    callback: (err: ServiceError | null, result: TResult) => void
  ) => any
): (arg1: T1, arg2?: Metadata) => Promise<TResult> {
  return (arg1, arg2) =>
    new Promise((resolve, reject) => {
      try {
        const callback: (err: ServiceError | null, result: TResult) => void = (
          err: ServiceError | null,
          d: TResult
        ) => {
          if (err) {
            reject(err)
          }
          resolve(d)
        }
        if (arg2) {
          fn(arg1, arg2, callback)
        } else {
          fn(arg1, new Metadata(), callback)
        }
      } catch (e) {
        reject(e)
      }
    })
}
