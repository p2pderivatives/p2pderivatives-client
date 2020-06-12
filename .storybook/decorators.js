import React from 'react'
import { UserProvider } from '../src/renderer/providers/User'

export const withUserProvider = (story) => (
  <UserProvider userFn={() => Promise.resolve('John Doe') }>
    { story() }
  </UserProvider>
)
