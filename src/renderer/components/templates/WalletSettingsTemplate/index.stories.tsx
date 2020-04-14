import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import { action } from '@storybook/addon-actions'
import WalletSettingsTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Templates/WalletSettingsTemplate',
  decorators: [StoryRouter()],
}

export const walletSettingsTemplate = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <WalletSettingsTemplate checkSettings={action('checkSettings')} />
    </div>
  </MuiThemeProvider>
)
