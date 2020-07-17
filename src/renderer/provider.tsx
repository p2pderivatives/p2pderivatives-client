import React, { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { AnyAction, Store } from 'redux'
import { ApplicationState } from './store'

const ProviderWrapper = ({
  children,
  store,
}: {
  children: ReactElement
  store: Store<ApplicationState, AnyAction>
}): JSX.Element => (
  <>
    <Provider store={store}>{children}</Provider>
  </>
)

export default ProviderWrapper
