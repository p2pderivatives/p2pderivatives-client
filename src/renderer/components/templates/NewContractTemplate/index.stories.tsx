import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import { action } from '@storybook/addon-actions'
import NewContractTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { User } from '../../../../common/models/user/User'
import { DateTime, Duration } from 'luxon'
import { OracleAssetConfiguration } from '../../../../common/oracle/oracle'

export default {
  title: 'Components/Templates/NewContractTemplate',
  decorators: [StoryRouter()],
}

const testUsers: User[] = [
  new User('Jane Doe'),
  new User('Joe Exotic'),
  new User('Dirk Daggers'),
]

const oracleInfo: OracleAssetConfiguration = {
  startDate: DateTime.fromObject({
    year: 2020,
    month: 6,
    day: 10,
    hour: 13,
    minute: 30,
  }),
  range: Duration.fromObject({ hours: 2 }),
  frequency: Duration.fromObject({ minute: 5 }),
}

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
        oracleInfo={oracleInfo}
      />
    </div>
  </MuiThemeProvider>
)
