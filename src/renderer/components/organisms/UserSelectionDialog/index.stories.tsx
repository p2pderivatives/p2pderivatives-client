import { MuiThemeProvider } from '@material-ui/core'
import { action } from '@storybook/addon-actions'
import React, { ReactElement } from 'react'
import { User } from '../../../../common/models/user'
import theme from '../../theme'
import UserSelectionDialog from './'

export default {
  title: 'Components/Organisms/UserSelectionDialog',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

const testUsers: User[] = [
  { name: 'Jane Doe' },
  { name: 'Joe Exotic' },
  { name: 'Dirk Daggers' },
]

export const userSelectionDialog = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ height: 1366, width: 768, display: 'flex' }}>
      <UserSelectionDialog
        open={true}
        onSelect={action('onSelect')}
        onClose={action('onClose')}
        users={testUsers}
      />
    </div>
  </MuiThemeProvider>
)
