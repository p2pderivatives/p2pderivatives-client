export {}

declare global {
  interface Window {
    api: {
      callMain: <T, V>(channel: string, data?: T) => Promise<V>
      answerMain: <T>(channel: string, data: T) => () => void
    }
  }
}
