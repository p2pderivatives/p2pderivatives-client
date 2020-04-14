import React, { FC, useEffect } from 'react'
import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'

import { useSnackbar } from '../../../providers/Snackbar'

import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'

import RegisterTemplate from '../../templates/RegisterTemplate'
import { ApplicationState } from '../../../store'
import { registerRequest } from '../../../store/user/actions'
import { isValidPassword } from '../../../util/password-validator'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const RegistrationPage: FC = () => {
  const snackbar = useSnackbar()

  const isRegistering = useSelector(state => state.user.isRegistering)
  const isRegistered = useSelector(state => state.user.isRegistered)
  const registrationError = useSelector(state => state.user.error)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isRegistering) {
      if (isRegistered) {
        snackbar.createSnack('Registered successfully!', 'success')
      } else if (registrationError) {
        snackbar.createSnack('Error: ' + registrationError, 'error')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegistering, isRegistered, registrationError])

  const onSubmit = (username: string, password: string): void => {
    const validationError = isValidPassword(password)
    if (validationError) {
      snackbar.createSnack(validationError, 'error')
    } else {
      dispatch(registerRequest(username, password))
    }
  }
  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <Backdrop open={isRegistering}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <RegisterTemplate onSubmit={onSubmit} />
    </div>
  )
}

export default RegistrationPage
