import React, { ReactElement } from 'react'
import { Container } from '@material-ui/core'
import DataGrid from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { ContractSimple } from '../../../../common/models/ipc/ContractSimple'
import { DateTime } from 'luxon'

export default {
  title: 'Components/Organisms/DataGrid',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

const contracts: ContractSimple[] = [
  {
    id: 'testid1',
    state: ContractState.Offered,
    counterPartyName: 'UserB',
    feeRate: 1.01,
    localCollateral: 2.01,
    maturityTime: 'sdjsad', //new DateTime().toISODate(),
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
  },
  {
    id: 'testid2',
    state: ContractState.Accepted,
    counterPartyName: 'UserB',
    feeRate: 1.01,
    localCollateral: 2.01,
    maturityTime: 'dsaod', //new DateTime().toISODate(),
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
  },
  {
    id: 'testid3',
    state: ContractState.MutualClosed,
    counterPartyName: 'UserB',
    feeRate: 1.01,
    localCollateral: 2.01,
    maturityTime: 'JOIJ', //new DateTime().toISODate(),
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
  },
]

export const sampleTable = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <div style={{ height: '100%' }}>
        <DataGrid title={'Contracts'} data={contracts} />
      </div>
    </div>
  </MuiThemeProvider>
)
