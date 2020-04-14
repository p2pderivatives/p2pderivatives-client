import React, { ReactElement } from 'react'
import StoryRouter from 'storybook-react-router'
import ContractListTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Templates/ContractListTemplate',
  decorators: [StoryRouter()],
}

export const contractList = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <ContractListTemplate />
    </div>
  </MuiThemeProvider>
)
