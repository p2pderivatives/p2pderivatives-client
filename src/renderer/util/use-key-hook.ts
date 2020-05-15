import { KeyboardEvent } from 'react'

export const useKeyHook = (
  key: string,
  handler: () => void
): ((event: KeyboardEvent<HTMLDivElement>) => void) => {
  const genFn = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === key) {
      handler()
    }
  }
  return genFn
}
