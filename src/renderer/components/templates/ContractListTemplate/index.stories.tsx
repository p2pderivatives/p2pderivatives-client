import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import ContractListTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import { action } from '@storybook/addon-actions'
import theme from '../../theme'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { Contract } from '../../../../common/models/dlc/Contract'
import { DateTime } from 'luxon'
import { contracts } from '../../stories-data/contracts'

export default {
  title: 'Components/Templates/ContractListTemplate',
  decorators: [StoryRouter()],
}

export const contractList = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <ContractListTemplate
        username={'John Doe'}
        data={contracts}
        onContractClicked={action('onContractClicked')}
      />
    </div>
  </MuiThemeProvider>
)
