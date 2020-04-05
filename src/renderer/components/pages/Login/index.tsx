import React, { FC, useEffect, useState } from 'react'
import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'
import { push } from 'connected-react-router'

import { useSnackbar } from '../../../providers/Snackbar'

import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'

import LoginTemplate from '../../templates/LoginTemplate'
import { ApplicationState } from '../../../store'
import { loginRequest } from '../../../store/login/actions'
import { configRequest } from '../../../store/bitcoin/actions'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const LoginPage: FC = () => {
  const snackbar = useSnackbar()

  const [submitted, setSubmitted] = useState(false)
  const isLoggingIn = useSelector(state => state.login.loggingIn)
  const isLoggedIn = useSelector(state => state.login.loggedIn)
  const loginError = useSelector(state => state.login.error)
  const dispatch = useDispatch()

  const handleClose = () => {
    if (isLoggedIn) {
      dispatch(configRequest())
      dispatch(push('/main'))
    }
  }

  useEffect(() => {
    if (submitted && !isLoggingIn) {
      setSubmitted(false)
      if (isLoggedIn) {
        snackbar.createSnack(
          'Logged in successfully, redirecting to main page.',
          'success',
          handleClose
        )
      } else if (loginError) {
        snackbar.createSnack('Error: ' + loginError, 'error', handleClose)
      }
    }
  }, [isLoggingIn, isLoggedIn, loginError, submitted, snackbar, handleClose])

  const onSubmit = (username: string, password: string) => {
    dispatch(loginRequest(username, password))
    setSubmitted(true)
  }
  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <Backdrop open={isLoggingIn}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <LoginTemplate onSubmit={onSubmit} />
    </div>
  )
}

export default LoginPage
