import React from 'react'
import { Route, Switch } from 'react-router'

import Root from '../components/root'
import Login from '../components/pages/Login'
import Registration from '../components/pages/Registration'
import ContractOverview from '../components/pages/ContractOverview'
import WalletSettings from '../components/pages/WalletSettings'

const routes = (
  <div>
    <Root>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/register" component={Registration} />
        <Route exact path="/main" component={ContractOverview} />
        <Route exact path="/wallet-settings" component={WalletSettings} />
      </Switch>
    </Root>
  </div>
)

export default routes
