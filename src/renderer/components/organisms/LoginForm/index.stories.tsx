import React, { ReactElement } from 'react'
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

export const loginForm = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="xs">
      <LoginForm
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onSubmit={(username, password): void => {}}
        error={text('Error', '')}
      />
    </Container>
  </MuiThemeProvider>
)
