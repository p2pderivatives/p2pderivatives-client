import React, { FC, useEffect, useState } from 'react'
import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'
import { goBack } from 'connected-react-router'

import { useSnackbar } from '../../../providers/Snackbar'

import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'

import WalletSettingsTemplate from '../../templates/WalletSettingsTemplate'
import { ApplicationState } from '../../../store'
import {
  checkRequest,
  balanceRequest,
  configRequest,
} from '../../../store/bitcoin/actions'

import { BitcoinDConfig } from '../../../../common/models/ipc/BitcoinDConfig'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const WalletSetings: FC = () => {
  const snackbar = useSnackbar()
  const dispatch = useDispatch()

  const [submitted, setSubmitted] = useState(false)
  const [balanceRequested, setBalanceRequested] = useState(false)
  const processing = useSelector(state => state.bitcoin.processing)
  const checkSuccessful = useSelector(state => state.bitcoin.checkSuccessful)
  const balance = useSelector(state => state.bitcoin.balance)
  const bitcoinError = useSelector(state => state.bitcoin.error)
  const bitcoinConfig = useSelector(state => state.bitcoin.config)

  useEffect(() => {
    if (submitted && !processing) {
      setSubmitted(false)
      if (checkSuccessful) {
        snackbar.createSnack(
          'Configuration was validated successfully. Retrieving balance...',
          'success',
          () => {
            dispatch(balanceRequest())
            dispatch(configRequest())
            setBalanceRequested(true)
          }
        )
      } else if (bitcoinError) {
        snackbar.createSnack(
          'Error validating settings: ' + bitcoinError,
          'error'
        )
      }
    }
    if (!processing && balanceRequested && balance !== undefined) {
      setBalanceRequested(false)
      snackbar.createSnack(
        'Balance for configured wallet: ' + balance,
        'success'
      )
    }
  }, [
    submitted,
    processing,
    checkSuccessful,
    bitcoinError,
    balance,
    balanceRequested,
    snackbar,
    dispatch,
  ])

  const onSubmit = (config: BitcoinDConfig) => {
    dispatch(checkRequest(config))
    setSubmitted(true)
  }
  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <Backdrop open={processing}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <WalletSettingsTemplate
        config={bitcoinConfig}
        checkSettings={onSubmit}
        onBack={() => dispatch(goBack())}
      />
    </div>
  )
}

export default WalletSetings
