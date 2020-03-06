import React from 'react'
import { Route, Switch } from 'react-router'

import Root from '../components/root'
import Login from '../components/pages/Login'
import Registration from '../components/pages/Registration'
import ContractOverview from '../components/pages/ContractOverview'

const routes = (
  <div>
    <Root>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/register" component={Registration} />
        <Route exact path="/main" component={ContractOverview} />
      </Switch>
    </Root>
  </div>
)

export default routes
