import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import ContractDetailTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { Contract } from '../../../../common/models/dlc/Contract'
import { contracts } from '../../stories-data/contracts'

export default {
  title: 'Components/Templates/ContractDetailTemplate',
  decorators: [StoryRouter()],
}

const contract: Contract = contracts[0]

export const contractDetail = (): ReactElement => (
  <div style={{ width: 1366, height: 768 }}>
    <MuiThemeProvider theme={theme}>
      <ContractDetailTemplate data={contract} isProposal={false} />
    </MuiThemeProvider>
  </div>
)
