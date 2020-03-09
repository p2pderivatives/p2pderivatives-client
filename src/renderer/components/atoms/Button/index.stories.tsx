import React from 'react'
import Button from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

import { withKnobs, text, boolean, select } from '@storybook/addon-knobs'

export default {
  title: 'Components/Atoms/Button',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

type buttonColorType = 'primary' | 'secondary' | 'inherit' | 'default'
const buttonColorValues: buttonColorType[] = ['primary', 'secondary']

export const button = () => (
  <MuiThemeProvider theme={theme}>
    <Button
      variant="contained"
      disabled={boolean('Disabled', false)}
      color={select('Color', buttonColorValues, 'primary')}
    >
      {text('Label', 'Label goes here')}
    </Button>
  </MuiThemeProvider>
)

export const outlinedButton = () => (
  <MuiThemeProvider theme={theme}>
    <Button
      variant="outlined"
      disabled={boolean('Disabled', false)}
      color={select('Color', buttonColorValues, 'primary')}
    >
      {text('Label', 'Label goes here')}
    </Button>
  </MuiThemeProvider>
)
