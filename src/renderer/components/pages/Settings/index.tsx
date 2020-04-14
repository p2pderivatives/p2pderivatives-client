import React, { FC, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Route, Switch } from 'react-router'
import { goBack, CallHistoryMethodAction } from 'connected-react-router'

import { makeStyles } from '@material-ui/core'

import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'

import SettingsTemplate from '../../templates/SettingsTemplate'
import WalletSettings from './WalletSettings'
import ChangePassword from './ChangePassword'

const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.appBar + 1,
  },
}))

const Settings: FC = () => {
  const dispatch = useDispatch()
  const classes = useStyles()

  const [isLoading, setLoading] = useState(false)

  const handleLoading = (loading: boolean): void => {
    setLoading(loading)
  }

  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <SettingsTemplate
        onBack={(): CallHistoryMethodAction<[]> => dispatch(goBack())}
      >
        <Switch>
          <Route path="/settings/bitcoind">
            <WalletSettings onLoading={handleLoading} />
          </Route>
          <Route path="/settings/password">
            <ChangePassword onLoading={handleLoading} />
          </Route>
        </Switch>
      </SettingsTemplate>
    </div>
  )
}

export default Settings
