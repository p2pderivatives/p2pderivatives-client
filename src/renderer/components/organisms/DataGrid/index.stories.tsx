import React, { ReactElement } from 'react'
import DataGrid from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { contracts } from '../../stories-data/contracts'

export default {
  title: 'Components/Organisms/DataGrid',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const sampleTable = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <div style={{ height: '100%' }}>
        <DataGrid title={'Contracts'} data={contracts} />
      </div>
    </div>
  </MuiThemeProvider>
)
