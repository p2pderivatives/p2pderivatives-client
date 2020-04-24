import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import { action } from '@storybook/addon-actions'
import NewContractTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Templates/NewContractListTemplate',
  decorators: [StoryRouter()],
}

export const newContract = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <NewContractTemplate
        onCSVImport={action('onCSVImport')}
        data={[]}
        tab={1}
        onTabChange={action('onTabChange')}
        onCancel={action('onCancel')}
      />
    </div>
  </MuiThemeProvider>
)
