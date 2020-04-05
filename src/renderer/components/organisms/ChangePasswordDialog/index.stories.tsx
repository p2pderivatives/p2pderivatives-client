import React from 'react'
import ChangePasswordDialog from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Organisms/ChangePasswordDialog',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const changePasswordDialog = () => (
  <MuiThemeProvider theme={theme}>
    <div style={{ height: 1366, width: 768, display: 'flex' }}>
      <ChangePasswordDialog
        open={true}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onClose={() => {}}
      />
    </div>
  </MuiThemeProvider>
)
