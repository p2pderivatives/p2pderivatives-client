import React from 'react'
import Fab from './'
import AddIcon from '@material-ui/icons/Add'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

import { withKnobs, text, boolean, select } from '@storybook/addon-knobs'

export default {
  title: 'Components/Atoms/Fab',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

type buttonColorType = 'primary' | 'secondary' | 'inherit' | 'default'
const buttonColorValues: buttonColorType[] = ['primary', 'secondary']

export const fab = () => (
  <MuiThemeProvider theme={theme}>
    <Fab
      variant="extended"
      disabled={boolean('Disabled', false)}
      color={select('Color', buttonColorValues, 'primary')}
    >
      <AddIcon />
      {text('Label', 'New contract')}
    </Fab>
  </MuiThemeProvider>
)

export const justTextFab = () => (
  <MuiThemeProvider theme={theme}>
    <Fab
      variant="extended"
      disabled={boolean('Disabled', false)}
      color={select('Color', buttonColorValues, 'primary')}
    >
      {text('Label', 'New contract')}
    </Fab>
  </MuiThemeProvider>
)
