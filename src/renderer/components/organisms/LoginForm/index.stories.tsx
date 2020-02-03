import React from 'react'
import LoginForm from './'
import { Container } from '@material-ui/core'

export default {
  title: 'Components/Organisms/LoginForm',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const loginForm = () => (
  <Container maxWidth="xs">
    <LoginForm onSubmit={(username, password): void => {}} />
  </Container>
)
