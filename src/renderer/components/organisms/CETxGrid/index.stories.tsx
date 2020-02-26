import React from 'react'
import { Container } from '@material-ui/core'
import CETxGrid from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Organisms/CETxGrid',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const sampleTable = () => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="lg">
      <CETxGrid title={'All Contracts'} data={data} />
    </Container>
  </MuiThemeProvider>
)

const data = [
  {
    fixingPrice: 3000.001,
    partyArec: 0.5,
    partyBrec: 0.0,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.45,
    partyBrec: 0.05,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.4,
    partyBrec: 0.1,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.35,
    partyBrec: 0.15,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.3,
    partyBrec: 0.2,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.25,
    partyBrec: 0.25,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.2,
    partyBrec: 0.3,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.15,
    partyBrec: 0.35,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.1,
    partyBrec: 0.4,
  },
]
