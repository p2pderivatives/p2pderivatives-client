import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import { action } from '@storybook/addon-actions'
import NewContractTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { User } from '../../../../common/models/user/User'

export default {
  title: 'Components/Templates/NewContractListTemplate',
  decorators: [StoryRouter()],
}

const testUsers: User[] = [
  new User('Jane Doe'),
  new User('Joe Exotic'),
  new User('Dirk Daggers'),
]

export const newContract = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <NewContractTemplate
        onCSVImport={action('onCSVImport')}
        data={[]}
        tab={1}
        users={testUsers}
        onTabChange={action('onTabChange')}
        onCancel={action('onCancel')}
      />
    </div>
  </MuiThemeProvider>
)
