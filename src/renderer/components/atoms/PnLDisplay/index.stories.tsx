import React, { ReactElement } from 'react'
import PnLDisplay from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

import { withKnobs, number } from '@storybook/addon-knobs'

export default {
  title: 'Components/Atoms/PasswordInput',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const passwordInput = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <PnLDisplay value={number('value', 10)} />
  </MuiThemeProvider>
)
