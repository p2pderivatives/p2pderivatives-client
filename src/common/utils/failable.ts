export type Failable<R, E> = Readonly<Failed<E> | Succeed<R>>

type Failed<ErrorType> = {
  success: false
  error: ErrorType
}

type Succeed<DataType> = {
  success: true
  value: DataType
}

export function isSuccessful<R, E>(obj: Failable<R, E>): obj is Succeed<R> {
  return obj.success
}

export function isFailed<R, E>(obj: Failable<R, E>): obj is Failed<E> {
  return !obj.success
}
