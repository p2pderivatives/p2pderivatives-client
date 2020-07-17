import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import ContractListTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { contracts } from '../../stories-data/contracts'
import { action } from '@storybook/addon-actions'
import ProviderWrapper from '../../../provider'
import configureStore from '../../stories-data/createStoriesStore'

export default {
  title: 'Components/Templates/ContractListTemplate',
  decorators: [StoryRouter()],
}

const store = configureStore()

export const contractList = (): ReactElement => (
  <ProviderWrapper store={store}>
    <MuiThemeProvider theme={theme}>
      <div style={{ width: 1366, height: 768 }}>
        <ContractListTemplate
          data={contracts}
          username={'UserA'}
          onContractClicked={action('onContractClicked')}
        />
      </div>
    </MuiThemeProvider>
  </ProviderWrapper>
)
