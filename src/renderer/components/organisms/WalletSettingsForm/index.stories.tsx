/* eslint-disable @typescript-eslint/no-empty-function */
import React, { ReactElement } from 'react'
import WalletSettingsForm from './'
import { MuiThemeProvider } from '@material-ui/core'
import Container from '@material-ui/core/Container'
import theme from '../../theme'

export default {
  title: 'Components/Organisms/WalletSettingsForm',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const walletSettingsForm = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="xs">
      <WalletSettingsForm checkSettings={(): void => {}} />
    </Container>
  </MuiThemeProvider>
)
