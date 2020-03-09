import React from 'react'
import StoryRouter from 'storybook-react-router'
import NewContractTemplate from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Templates/NewContractListTemplate',
  decorators: [StoryRouter()],
}

export const newContract = () => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <NewContractTemplate />
    </div>
  </MuiThemeProvider>
)
