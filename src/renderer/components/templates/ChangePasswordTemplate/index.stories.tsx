import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import { action } from '@storybook/addon-actions'
import ChangePasswordTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Templates/ChangePasswordTemplate',
  decorators: [StoryRouter()],
}

export const changePasswordTemplate = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <ChangePasswordTemplate onSubmit={action('onSubmit')} />
    </div>
  </MuiThemeProvider>
)
