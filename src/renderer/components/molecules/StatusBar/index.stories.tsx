import React from 'react'
import StatusBar from '.'
import { Container } from '@material-ui/core'

export default {
  title: 'Components/Molecules/StatusBar',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const statusBar = () => (
  <Container maxWidth="xs">
    <StatusBar />
  </Container>
)
