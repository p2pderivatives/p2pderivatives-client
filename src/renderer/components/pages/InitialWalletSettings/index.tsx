import React, { FC, useState } from 'react'
import { useDispatch } from 'react-redux'
import { push } from 'connected-react-router'

import { makeStyles, Typography } from '@material-ui/core'

import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'

import WalletSettings from '../Settings/WalletSettings'

const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.appBar + 1,
  },
  container: {
    padding: '2rem',
    backgroundColor: '#303855',
    color: 'white',
  },
}))

const InitialWalletSettings: FC = () => {
  const dispatch = useDispatch()
  const classes = useStyles()

  const [isLoading, setLoading] = useState(false)

  const handleLoading = (loading: boolean): void => {
    setLoading(loading)
  }

  const handleSettingsSaved = (): void => {
    dispatch(push('/main'))
  }

  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className={classes.container}>
        <Typography variant="h5">Wallet configuration</Typography>
        <Typography variant="caption">
          You need to set up your wallet before using the application.
        </Typography>
        <WalletSettings
          onLoading={handleLoading}
          onSaved={handleSettingsSaved}
        />
      </div>
    </div>
  )
}

export default InitialWalletSettings
