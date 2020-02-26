import React from 'react'
import StatusBar from '.'
import { Container } from '@material-ui/core'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Molecules/StatusBar',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const statusBar = () => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="xs">
      <StatusBar />
    </Container>
  </MuiThemeProvider>
)
