import React from 'react'
import RegisterForm from '.'
import { Container } from '@material-ui/core'

export default {
  title: 'Components/Organisms/RegisterForm',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const registerForm = () => (
  <Container maxWidth="xs">
    <RegisterForm onSubmit={(username, password): void => {}} />
  </Container>
)
