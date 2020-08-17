/* eslint-disable @typescript-eslint/no-explicit-any */

export type PromiseType<T> = T extends PromiseLike<infer U> ? U : T
export type ReturnTypeAsync<T extends (...args: any) => any> = ReturnType<
  T
> extends PromiseLike<infer U>
  ? U
  : ReturnType<T>
