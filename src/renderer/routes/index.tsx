import React from 'react'
import { Route, Switch } from 'react-router'
import Login from '../components/Login/Login'
import Register from '../components/Register/Register'

const routes = (
  <div>
    <Switch>
      <Route exact path="/" component={Login} />
      <Route exact path="/register" component={Register} />
    </Switch>
  </div>
)

export default routes
