import React, { ReactElement } from 'react'
import ContractView from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { contracts } from '../../stories-data/contracts'
import { action } from '@storybook/addon-actions'
import { number, withKnobs } from '@storybook/addon-knobs'

export default {
  title: 'Components/Organisms/ContractView',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const sampleTable = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <div style={{ height: '100%' }}>
        <ContractView
          data={contracts[0]}
          acceptContract={action('Accept Contract')}
          rejectContract={action('Reject Contract')}
          cancel={action('Cancel')}
          availableAmount={number('Available Amount', 300000000)}
        />
      </div>
    </div>
  </MuiThemeProvider>
)
