import React from 'react'
import StoryRouter from 'storybook-react-router'
import { action } from '@storybook/addon-actions'
import LoginTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

import { withKnobs, text } from '@storybook/addon-knobs'


export default {
  title: 'Components/Templates/LoginTemplate',
  decorators: [withKnobs, StoryRouter()],
}

export const loginTemplate = () => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <LoginTemplate onSubmit={action('onSubmit')} error={text('Error', '')}/>
    </div>
  </MuiThemeProvider>
)
