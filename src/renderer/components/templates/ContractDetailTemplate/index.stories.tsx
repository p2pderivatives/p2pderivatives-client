import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import ContractDetailTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { ContractSimple } from '../../../../common/models/ipc/ContractSimple'

export default {
  title: 'Components/Templates/ContractDetailTemplate',
  decorators: [StoryRouter()],
}

const contract: ContractSimple = {
  id: 'testid1',
  state: ContractState.Offered,
  counterPartyName: 'UserB',
  feeRate: 1.01,
  localCollateral: 2.01,
  maturityTime: new Date(),
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
}

export const contractDetail = (): ReactElement => (
  <div style={{ width: 1366, height: 768 }}>
    <MuiThemeProvider theme={theme}>
      <ContractDetailTemplate data={contract} isProposal={false} />
    </MuiThemeProvider>
  </div>
)
