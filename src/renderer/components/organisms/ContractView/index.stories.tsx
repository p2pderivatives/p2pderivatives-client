import React, { ReactElement } from 'react'
import { Container } from '@material-ui/core'
import ContractView from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { ContractSimple } from '../../../../common/models/ipc/ContractSimple'

export default {
  title: 'Components/Organisms/ContractView',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

const contract: ContractSimple = {
  id: 'testid1',
  state: ContractState.Offered,
  counterPartyName: 'UserB',
  feeRate: 1.01,
  localCollateral: 2.01,
  maturityTime: 'JAJA', //new DateTime().toISODate(),
  remoteCollateral: 2.99,
  outcomes: [
    {
      local: 5,
      remote: 0,
      message: 'yes',
    },
    {
      local: 0,
      remote: 5.0,
      message: 'no',
    },
    {
      local: 2.5,
      remote: 2.5,
      message: 'maybe',
    },
  ],
  finalOutcome: {
    message: 'yes',
    local: 5,
    remote: 0,
  },
}

export const sampleTable = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <div style={{ height: '100%' }}>
        <ContractView data={contract} />
      </div>
    </div>
  </MuiThemeProvider>
)
