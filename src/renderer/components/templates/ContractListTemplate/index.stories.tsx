import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import ContractListTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import { action } from '@storybook/addon-actions'
import theme from '../../theme'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { ContractSimple } from '../../../../common/models/ipc/ContractSimple'
import { DateTime } from 'luxon'

const contracts: ContractSimple[] = [
  {
    id: 'testid1',
    state: ContractState.Offered,
    counterPartyName: 'UserB',
    feeRate: 1.01,
    localCollateral: 2.01,
    maturityTime: new DateTime().toISODate(),
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
    maturityTime: new DateTime().toISODate(),
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
    maturityTime: new DateTime().toISODate(),
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

export default {
  title: 'Components/Templates/ContractListTemplate',
  decorators: [StoryRouter()],
}

export const contractList = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <ContractListTemplate
        data={contracts}
        onContractClicked={action('onContractClicked')}
      />
    </div>
  </MuiThemeProvider>
)
