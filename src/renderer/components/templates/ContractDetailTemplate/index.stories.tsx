import { MuiThemeProvider } from '@material-ui/core'
import { action } from '@storybook/addon-actions'
import { number, withKnobs } from '@storybook/addon-knobs'
import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import ProviderWrapper from '../../../provider'
import { contracts } from '../../stories-data/contracts'
import configureStore from '../../stories-data/createStoriesStore'
import theme from '../../theme'
import ContractDetailTemplate from './'

export default {
  title: 'Components/Templates/ContractDetailTemplate',
  decorators: [StoryRouter(), withKnobs],
}

const store = configureStore()

export const contractDetail = (): ReactElement => (
  <ProviderWrapper store={store}>
    <div style={{ width: 1366, height: 768 }}>
      <MuiThemeProvider theme={theme}>
        <ContractDetailTemplate
          data={contracts[0]}
          acceptContract={action('Accept Contract')}
          rejectContract={action('Reject Contract')}
          cancel={action('Cancel')}
          availableAmount={number('Available amount', 300000000)}
        />
      </MuiThemeProvider>
    </div>
  </ProviderWrapper>
)
