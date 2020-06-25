import React from 'react'
import { StatusBarProvider } from '../src/renderer/providers/StatusBar'

export const withStatusBarProvider = (story) => (
  <StatusBarProvider userFn={() => Promise.resolve('John Doe') } balanceFn={() => Promise.resolve(1.337)}>
    { story() }
  </StatusBarProvider>
)
