import React, { ReactElement } from 'react'
import { Container } from '@material-ui/core'
import OutcomesGrid from './'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Organisms/OutcomesGrid',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const sampleTable = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="lg">
      <OutcomesGrid title={'All Contracts'} data={data} />
    </Container>
  </MuiThemeProvider>
)

const data = [
  {
    message: 3000.001,
    local: 0.5,
    remote: 0.0,
  },
  {
    message: 3000.001,
    local: 0.45,
    remote: 0.05,
  },
  {
    message: 3000.001,
    local: 0.4,
    remote: 0.1,
  },
  {
    message: 3000.001,
    local: 0.35,
    remote: 0.15,
  },
  {
    message: 3000.001,
    local: 0.3,
    remote: 0.2,
  },
  {
    message: 3000.001,
    local: 0.25,
    remote: 0.25,
  },
  {
    message: 3000.001,
    local: 0.2,
    remote: 0.3,
  },
  {
    message: 3000.001,
    local: 0.15,
    remote: 0.35,
  },
  {
    message: 3000.001,
    local: 0.1,
    remote: 0.4,
  },
]
