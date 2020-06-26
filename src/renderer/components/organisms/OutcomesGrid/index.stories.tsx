import React, { ReactElement } from 'react'
import { Container } from '@material-ui/core'
import OutcomesGrid from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { contracts } from '../../stories-data/contracts'

export default {
  title: 'Components/Organisms/OutcomesGrid',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const sampleTable = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="lg">
      <OutcomesGrid title={'All Contracts'} data={contracts[0].outcomes} />
    </Container>
  </MuiThemeProvider>
)
