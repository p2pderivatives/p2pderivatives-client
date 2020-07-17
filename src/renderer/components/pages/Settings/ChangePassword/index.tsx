import React, { FC, useEffect, useState } from 'react'
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector as useReduxSelector,
} from 'react-redux'
import { useSnackbar } from '../../../../providers/Snackbar'
import { ApplicationState } from '../../../../store'
import { changePasswordRequest } from '../../../../store/login/actions'
import { isValidPassword } from '../../../../util/password-validator'
import ChangePasswordTemplate from '../../../templates/ChangePasswordTemplate'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const ChangePassword: FC = () => {
  const snackbar = useSnackbar()
  const dispatch = useDispatch()

  const [submitted, setSubmitted] = useState(false)
  const processing = useSelector(state => state.login.changingPassword)
  const changePWSuccessful = useSelector(state => state.login.changedPassword)
  const changePWError = useSelector(state => state.login.error)

  useEffect(() => {
    if (submitted && !processing) {
      setSubmitted(false)
      if (changePWSuccessful) {
        snackbar.createSnack('Password successfully changed.', 'success')
      } else if (changePWError) {
        snackbar.createSnack(
          'Error validating settings: ' + changePWError,
          'error'
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, processing, changePWSuccessful, changePWError])

  const onSubmit = (oldPassword: string, newPassword: string): void => {
    let validationError = isValidPassword(newPassword)
    if (oldPassword === newPassword) {
      validationError = "New password can't be the same as the old password!"
    }
    if (validationError) {
      snackbar.createSnack(validationError, 'error')
    } else {
      dispatch(changePasswordRequest(oldPassword, newPassword))
      setSubmitted(true)
    }
  }
  return <ChangePasswordTemplate onSubmit={onSubmit} />
}

export default ChangePassword
