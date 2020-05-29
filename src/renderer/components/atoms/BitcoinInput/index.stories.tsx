import React from 'react'
import BitcoinInput from '.'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

import { withKnobs, text, boolean } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'

export default {
  title: 'Components/Atoms/BitcoinInput',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const bitcoinInput = () => (
  <MuiThemeProvider theme={theme}>
    <BitcoinInput
      label={text('Label', 'Label goes here')}
      disabled={boolean('Disabled', false)}
      helperText={text('Helper text', 'Some help')}
      onChange={action('onChange')}
    />
  </MuiThemeProvider>
)
