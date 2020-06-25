import React, { ReactElement } from 'react'
import BtcDisplay from '.'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

import { withKnobs, number, boolean, select } from '@storybook/addon-knobs'

export default {
  title: 'Components/Atoms/BtcDisplay',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const btcDisplay = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <BtcDisplay
      satValue={number('satValue', 10)}
      pnlColors={boolean('pnlColor', false)}
      currency={select('currency', { btc: 'BTC', sats: 'sats' }, 'BTC')}
    />
  </MuiThemeProvider>
)
