import React, { FC, useState, useEffect } from 'react'
import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'
import { push } from 'connected-react-router'
import { ApplicationState } from '../../store'
import { refreshRequest } from '../../store/login/actions'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector
type LayoutProps = {
  children?: React.ReactNode
}

const Root: FC<LayoutProps> = (props: LayoutProps) => {
  const isLoggedIn = useSelector(state => state.login.loggedIn)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(push('/main'))
    }
  }, [isLoggedIn])
  dispatch(refreshRequest())

  return <div>{props.children}</div>
}

export default Root
