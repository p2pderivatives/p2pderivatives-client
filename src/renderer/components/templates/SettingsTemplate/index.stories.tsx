import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import { action } from '@storybook/addon-actions'
import SettingsTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import configureStore from '../../stories-data/createStoriesStore'
import ProviderWrapper from '../../../provider'

const store = configureStore()

export default {
  title: 'Components/Templates/SettingsTemplate',
  decorators: [StoryRouter()],
}

export const settingsTemplate = (): ReactElement => (
  <ProviderWrapper store={store}>
    <MuiThemeProvider theme={theme}>
      <div style={{ width: 1366, height: 768 }}>
        <SettingsTemplate onBack={action('onBack')}>
          <div>
            <p>Settings content</p>
          </div>
        </SettingsTemplate>
      </div>
    </MuiThemeProvider>
  </ProviderWrapper>
)
