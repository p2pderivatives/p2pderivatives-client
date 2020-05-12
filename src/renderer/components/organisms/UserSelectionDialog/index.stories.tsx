import React, { ReactElement } from 'react'
import UserSelectionDialog from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { User } from '../../../../common/models/user/User'

export default {
  title: 'Components/Organisms/UserSelectionDialog',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

const testUsers: User[] = [
  new User('Jane Doe'),
  new User('Joe Exotic'),
  new User('Dirk Daggers'),
]

export const userSelectionDialog = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ height: 1366, width: 768, display: 'flex' }}>
      <UserSelectionDialog
        open={true}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onClose={(): void => {}}
        users={testUsers}
      />
    </div>
  </MuiThemeProvider>
)
