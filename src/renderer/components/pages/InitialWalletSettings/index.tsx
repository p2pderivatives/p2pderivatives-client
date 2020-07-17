import { makeStyles, Typography } from '@material-ui/core'
import { push } from 'connected-react-router'
import React, { FC } from 'react'
import { useDispatch } from 'react-redux'
import WalletSettings from '../Settings/WalletSettings'

const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.appBar + 1,
  },
  container: {
    color: 'white',
    height: 'calc(100vh - 4rem)',
    width: 'calc(100vw - 4rem)',
    padding: '2rem',
    display: 'table',
    backgroundColor: '#303855',
  },
}))

const InitialWalletSettings: FC = () => {
  const dispatch = useDispatch()
  const classes = useStyles()

  const handleSettingsSaved = (): void => {
    dispatch(push('/main'))
  }

  return (
    <div className={classes.container}>
      <Typography variant="h5">Wallet configuration</Typography>
      <Typography variant="caption">
        You need to set up your wallet before using the application.
      </Typography>
      <WalletSettings onSaved={handleSettingsSaved} />
    </div>
  )
}

export default InitialWalletSettings
