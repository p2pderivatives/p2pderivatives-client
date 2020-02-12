import React, { FC } from 'react'
import { DateTime } from 'luxon'

import { makeStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import AddIcon from '@material-ui/icons/Add'

import Tabs, { TabItem } from '../../molecules/Tabs'
import DataGrid from '../../organisms/DataGrid'
import StatusBar from '../../molecules/StatusBar'
import Fab from '../../atoms/Fab'

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
  contentGrid: {
    height: '100%',
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
      <StatusBar />
      <Grid container className={classes.contentGrid}>
        <Grid item xs={2} alignItems="flex-start">
          <div className={classes.buttonContainer}>
            <Fab variant="extended" color="primary">
              <AddIcon />
              {'New contract'}
            </Fab>
          </div>
        </Grid>
        <Grid container item xs={10} direction="column">
          <Grid item xs>
            <Tabs items={tabItems} />
          </Grid>
          <Grid item xs>
            <DataGrid title={'All'} data={data} />
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

export default ContractListTemplate
