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
import { configRequest, checkRequest } from '../../../store/bitcoin/actions'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const LoginPage: FC = () => {
  const snackbar = useSnackbar()

  const [submitted, setSubmitted] = useState(false)
  const [configRequested, setConfigRequested] = useState(false)
  const isLoggingIn = useSelector(state => state.login.loggingIn)
  const isLoggedIn = useSelector(state => state.login.loggedIn)
  const loginError = useSelector(state => state.login.error)
  const bitcoinConfig = useSelector(state => state.bitcoin.config)
  const bitcoinProcessing = useSelector(state => state.bitcoin.processing)
  const [checkRequested, setCheckRequested] = useState(false)
  const checkSuccess = useSelector(state => state.bitcoin.checkSuccessful)

  const dispatch = useDispatch()

  const handleClose = (): void => {
    if (isLoggedIn) {
      dispatch(configRequest())
      setConfigRequested(true)
    }
  }

  useEffect(() => {
    if (isLoggedIn && configRequested && !bitcoinProcessing) {
      if (bitcoinConfig !== undefined && bitcoinConfig !== {}) {
        dispatch(checkRequest(bitcoinConfig))
        setCheckRequested(true)
        setConfigRequested(false)
      } else {
        dispatch(push('/initial-settings'))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bitcoinConfig, isLoggedIn, bitcoinProcessing, configRequested])

  useEffect(() => {
    if (isLoggedIn && checkRequested && !bitcoinProcessing) {
      if (checkSuccess) {
        dispatch(push('/main'))
      } else {
        snackbar.createSnack(
          'Error: could not connect to the bitcoind wallet',
          'error'
        )
        dispatch(push('/initial-settings'))
      }
    }
  })

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggingIn, isLoggedIn, loginError, submitted])

  const onSubmit = (username: string, password: string): void => {
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
