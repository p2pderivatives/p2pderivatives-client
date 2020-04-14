import React, { ReactElement } from 'react'
import StatusBar from '.'
import StoryRouter from 'storybook-react-router'
import { Container } from '@material-ui/core'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Molecules/StatusBar',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
  decorators: [StoryRouter()],
}

export const statusBar = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="xs">
      <StatusBar />
    </Container>
  </MuiThemeProvider>
)
