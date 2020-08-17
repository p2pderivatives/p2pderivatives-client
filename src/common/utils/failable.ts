export type Failable<R, E> = Readonly<Failed<E> | Succeed<R>>
export type FailableAsync<R, E> = Promise<Failable<R, E>>

export type Failed<ErrorType> = {
  success: false
  error: ErrorType
}

export type Succeed<DataType> = { success: true } & (DataType extends void
  ? {}
  : unknown extends DataType
  ? { value?: DataType }
  : { value: DataType })

export function isSuccessful<R, E>(obj: Failable<R, E>): obj is Succeed<R> {
  return obj.success
}

export function isFailed<R, E>(obj: Failable<R, E>): obj is Failed<E> {
  return !obj.success
}

export function Success<T>(value?: T): Succeed<T> {
  if (typeof value === 'undefined') {
    return { success: true } as Succeed<T>
  }
  return ({ success: true, value: value } as unknown) as Succeed<T>
}

export function Fail<E>(error: E): Failed<E> {
  return {
    success: false,
    error: error,
  }
}
