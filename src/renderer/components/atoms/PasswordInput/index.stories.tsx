import React, { ReactElement } from 'react'
import TextInput from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

import { withKnobs, text, boolean } from '@storybook/addon-knobs'

export default {
  title: 'Components/Atoms/PasswordInput',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const passwordInput = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <TextInput
      label={text('Label', 'Label goes here')}
      disabled={boolean('Disabled', false)}
      helperText={text('Helper text', 'Some help')}
    />
  </MuiThemeProvider>
)
