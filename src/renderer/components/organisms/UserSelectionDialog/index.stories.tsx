import React from 'react'
import UserSelectionDialog from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Organisms/UserSelectionDialog',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const userSelectionDialog = () => (
  <MuiThemeProvider theme={theme}>
    <div style={{ height: 1366, width: 768, display: 'flex' }}>
      <UserSelectionDialog open={true} onClose={() => {}} />
    </div>
  </MuiThemeProvider>
)
