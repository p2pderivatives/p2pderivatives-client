import { push } from 'connected-react-router'
import React, { FC } from 'react'
import { useDispatch } from 'react-redux'
import { Route, Switch } from 'react-router'
import SettingsTemplate from '../../templates/SettingsTemplate'
import ChangePassword from './ChangePassword'
import WalletSettings from './WalletSettings'

const Settings: FC = () => {
  const dispatch = useDispatch()

  const goToMain = (): void => {
    dispatch(push('/main'))
  }

  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <SettingsTemplate onBack={goToMain}>
        <div style={{ padding: '2rem' }}>
          <Switch>
            <Route path="/settings/bitcoind">
              <WalletSettings />
            </Route>
            <Route path="/settings/password">
              <ChangePassword />
            </Route>
          </Switch>
        </div>
      </SettingsTemplate>
    </div>
  )
}

export default Settings
