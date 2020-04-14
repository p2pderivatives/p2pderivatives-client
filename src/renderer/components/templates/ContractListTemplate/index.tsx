import React, { FC } from 'react'
import { DateTime } from 'luxon'

import { makeStyles } from '@material-ui/core'

import Tabs, { TabItem } from '../../molecules/Tabs'
import DataGrid from '../../organisms/DataGrid'
import MainLayout from '../../organisms/MainLayout'

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
  {
    contractId: 'XX0010',
    product: 'TFC',
    status: 'Trade broadcast',
    sendAddress: 'xxxxxx',
    tradeDate: DateTime.utc()
      .plus({ days: 9 })
      .toString(),
    expirationDate: DateTime.utc().toString(),
  },
]

const useStyles = makeStyles({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#303855',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  contentDiv: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
})

const tabItems: TabItem[] = [
  { label: 'All' },
  { label: 'Approved' },
  { label: 'Completed' },
  { label: 'Published' },
]

const ContractListTemplate: FC = () => {
  const classes = useStyles()

  return (
    <div className={classes.rootContainer}>
      <MainLayout>
        <div className={classes.contentDiv}>
          <Tabs
            items={tabItems}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onTabChange={(tabIdx): void => {}}
          />
          <DataGrid title={'All'} data={data} />
        </div>
      </MainLayout>
    </div>
  )
}

export default ContractListTemplate
