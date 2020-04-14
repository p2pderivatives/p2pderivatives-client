import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import ContractDetailTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Templates/ContractDetailTemplate',
  decorators: [StoryRouter()],
}

export const contractDetail = (): ReactElement => (
  <div style={{ width: 1366, height: 768 }}>
    <MuiThemeProvider theme={theme}>
      <ContractDetailTemplate />
    </MuiThemeProvider>
  </div>
)
