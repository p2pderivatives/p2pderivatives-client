import React from 'react'
import LoginForm from './'
import { Container } from '@material-ui/core'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

import { withKnobs, text } from '@storybook/addon-knobs'

export default {
  title: 'Components/Organisms/LoginForm',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const loginForm = () => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="xs">
      <LoginForm
        onSubmit={(username, password): void => {}}
        error={text('Error', '')}
      />
    </Container>
  </MuiThemeProvider>
)
