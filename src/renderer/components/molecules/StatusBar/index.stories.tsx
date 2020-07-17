import React, { ReactElement } from 'react'
import StatusBar from '.'
import StoryRouter from 'storybook-react-router'
import { Container } from '@material-ui/core'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { action } from '@storybook/addon-actions'
import configureStore from '../../stories-data/createStoriesStore'
import ProviderWrapper from '../../../provider'

const store = configureStore()

export default {
  title: 'Components/Molecules/StatusBar',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
  decorators: [StoryRouter()],
}

export const statusBar = (): ReactElement => (
  <ProviderWrapper store={store}>
    <MuiThemeProvider theme={theme}>
      <Container maxWidth="xs">
        <StatusBar
          username={'John Storybook'}
          balance={1.337}
          refresh={action('refresh')}
        />
      </Container>
    </MuiThemeProvider>
  </ProviderWrapper>
)
