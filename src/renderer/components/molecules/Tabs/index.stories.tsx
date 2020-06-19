import React, { ReactElement } from 'react'
import Tabs, { TabItem } from '.'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Molecules/Tabs',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

const items: TabItem[] = [
  { label: 'All', new: 0 },
  { label: 'Approved', new: 99 },
  { label: 'Confirmed', new: 0 },
  { label: 'Requested', new: 2 },
]

export const tabs = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <Tabs
      items={items}
      value={1}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onTabChange={(): void => {}}
    />
  </MuiThemeProvider>
)
