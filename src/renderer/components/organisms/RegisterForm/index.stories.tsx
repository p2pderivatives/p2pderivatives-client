import React from 'react'
import RegisterForm from '.'
import { Container } from '@material-ui/core'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Organisms/RegisterForm',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const registerForm = () => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="xs">
      <RegisterForm
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onSubmit={(username, password): void => {}}
      />
    </Container>
  </MuiThemeProvider>
)
