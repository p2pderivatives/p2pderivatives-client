import React, { FC, useEffect, useState } from 'react'
import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'

import { useSnackbar } from '../../../../providers/Snackbar'

import WalletSettingsTemplate from '../../../templates/WalletSettingsTemplate'
import { ApplicationState } from '../../../../store'
import {
  checkRequest,
  balanceRequest,
  configRequest,
} from '../../../../store/bitcoin/actions'

import { BitcoinDConfig } from '../../../../../common/models/ipc/BitcoinDConfig'
import { LoadingProps } from '../../../props'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

type WalletSettingsProps = LoadingProps

const WalletSettings: FC<WalletSettingsProps> = (
  props: WalletSettingsProps
) => {
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
      props.onLoading(false)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    submitted,
    processing,
    checkSuccessful,
    bitcoinError,
    balance,
    balanceRequested,
  ])

  const onSubmit = (config: BitcoinDConfig): void => {
    props.onLoading(true)
    dispatch(checkRequest(config))
    setSubmitted(true)
  }
  return (
    <WalletSettingsTemplate config={bitcoinConfig} checkSettings={onSubmit} />
  )
}

export default WalletSettings
