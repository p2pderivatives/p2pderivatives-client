import React, { ReactElement } from 'react'
import ContractView from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { Contract } from '../../../../common/models/dlc/Contract'
import { contracts } from '../../stories-data/contracts'

export default {
  title: 'Components/Organisms/ContractView',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

const contract: Contract = contracts[0]

export const sampleTable = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <div style={{ width: 1366, height: 768 }}>
      <div style={{ height: '100%' }}>
        <ContractView data={contract} />
      </div>
    </div>
  </MuiThemeProvider>
)
