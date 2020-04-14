import React, { ReactElement } from 'react'
import { action, HandlerFunction } from '@storybook/addon-actions'
import ChangePasswordForm from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Organisms/ChangePasswordForm',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const changePasswordForm = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ height: 1366, width: 768, display: 'flex' }}>
      <ChangePasswordForm
        onSubmit={(oldPw, newPw): HandlerFunction => action('onSubmit')}
      />
    </div>
  </MuiThemeProvider>
)
