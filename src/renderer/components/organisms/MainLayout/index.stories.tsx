import React, { ReactElement } from 'react'
import MainLayout from './'
import StoryRouter from 'storybook-react-router'
import { MuiThemeProvider } from '@material-ui/core'
import { action } from '@storybook/addon-actions'
import theme from '../../theme'

export default {
  title: 'Components/Organisms/MainLayout',
  decorators: [StoryRouter()],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const mainLayout = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ height: 1366, width: 768, display: 'flex' }}>
      <MainLayout onBack={action('onBack')}>
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          <p>TEST CONTENT</p>
        </div>
      </MainLayout>
    </div>
  </MuiThemeProvider>
)

export const settingsLayout = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ height: 1366, width: 768, display: 'flex' }}>
      <MainLayout settingsConfig={true} onBack={action('onBack')}>
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          <p>TEST CONTENT</p>
        </div>
      </MainLayout>
    </div>
  </MuiThemeProvider>
)
