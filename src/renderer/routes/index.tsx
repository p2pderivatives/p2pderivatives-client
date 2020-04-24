import React from 'react'
import { Route, Switch } from 'react-router'

import Root from '../components/root'
import Login from '../components/pages/Login'
import Registration from '../components/pages/Registration'
import ContractOverview from '../components/pages/ContractOverview'
import NewContract from '../components/pages/NewContract'
import Settings from '../components/pages/Settings'

const routes = (
  <div>
    <Root>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/register" component={Registration} />
        <Route exact path="/main" component={ContractOverview} />
        <Route exact path="/new-contract" component={NewContract} />
        <Route path="/settings" component={Settings} />
      </Switch>
    </Root>
  </div>
)

export default routes
