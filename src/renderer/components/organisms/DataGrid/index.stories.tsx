import React from 'react'
import { Container } from '@material-ui/core'
import { DateTime } from 'luxon'
import DataGrid from './'

export default {
  title: 'Components/Organisms/DataGrid',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const sampleTable = () => (
  <Container maxWidth="lg">
    <DataGrid title={'Contracts'} data={data} />
  </Container>
)

const data = [
  {
    contractId: 'XX0001',
    product: 'TFC',
    status: 'Trade broadcast',
    sendAddress: 'xxxxxx',
    tradeDate: DateTime.utc()
      .plus({ days: 1 })
      .toString(),
    expirationDate: DateTime.utc().toString(),
  },
  {
    contractId: 'XX0002',
    product: 'TFC',
    status: 'Trade broadcast',
    sendAddress: 'xxxxxx',
    tradeDate: DateTime.utc()
      .plus({ days: 2 })
      .toString(),
    expirationDate: DateTime.utc().toString(),
  },
  {
    contractId: 'XX0003',
    product: 'TFC',
    status: 'Trade broadcast',
    sendAddress: 'xxxxxx',
    tradeDate: DateTime.utc()
      .plus({ days: 3 })
      .toString(),
    expirationDate: DateTime.utc().toString(),
  },
  {
    contractId: 'XX0004',
    product: 'TFC',
    status: 'Trade broadcast',
    sendAddress: 'xxxxxx',
    tradeDate: DateTime.utc()
      .plus({ days: 4 })
      .toString(),
    expirationDate: DateTime.utc().toString(),
  },
  {
    contractId: 'XX0005',
    product: 'TFC',
    status: 'Trade broadcast',
    sendAddress: 'xxxxxx',
    tradeDate: DateTime.utc()
      .plus({ days: 4 })
      .toString(),
    expirationDate: DateTime.utc().toString(),
  },
  {
    contractId: 'XX0006',
    product: 'TFC',
    status: 'Trade broadcast',
    sendAddress: 'xxxxxx',
    tradeDate: DateTime.utc()
      .plus({ days: 5 })
      .toString(),
    expirationDate: DateTime.utc().toString(),
  },
  {
    contractId: 'XX0007',
    product: 'TFC',
    status: 'Trade broadcast',
    sendAddress: 'xxxxxx',
    tradeDate: DateTime.utc()
      .plus({ days: 6 })
      .toString(),
    expirationDate: DateTime.utc().toString(),
  },
  {
    contractId: 'XX0008',
    product: 'TFC',
    status: 'Trade broadcast',
    sendAddress: 'xxxxxx',
    tradeDate: DateTime.utc()
      .plus({ days: 7 })
      .toString(),
    expirationDate: DateTime.utc().toString(),
  },
  {
    contractId: 'XX0009',
    product: 'TFC',
    status: 'Trade broadcast',
    sendAddress: 'xxxxxx',
    tradeDate: DateTime.utc()
      .plus({ days: 8 })
      .toString(),
    expirationDate: DateTime.utc().toString(),
  },
]
