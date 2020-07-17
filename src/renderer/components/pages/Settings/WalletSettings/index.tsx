import React, { FC, useEffect, useState } from 'react'
import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'

import { useSnackbar } from '../../../../providers/Snackbar'

import WalletSettingsTemplate from '../../../templates/WalletSettingsTemplate'
import { ApplicationState } from '../../../../store'
import { checkRequest, configRequest } from '../../../../store/bitcoin/actions'

import { BitcoinDConfig } from '../../../../../common/models/ipc/BitcoinDConfig'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

type WalletSettingsProps = {
  onSaved?: () => void
}

const WalletSettings: FC<WalletSettingsProps> = (
  props: WalletSettingsProps
) => {
  const snackbar = useSnackbar()
  const dispatch = useDispatch()

  const [submitted, setSubmitted] = useState(false)
  const processing = useSelector(state => state.bitcoin.processing)
  const checkSuccessful = useSelector(state => state.bitcoin.checkSuccessful)
  const bitcoinError = useSelector(state => state.bitcoin.error)
  const bitcoinConfig = useSelector(state => state.bitcoin.config)

  useEffect(() => {
    if (submitted && !processing) {
      setSubmitted(false)
      if (checkSuccessful) {
        if (props.onSaved) props.onSaved()
        snackbar.createSnack(
          'Configuration was validated successfully.',
          'success',
          () => {
            dispatch(configRequest())
          }
        )
      } else if (bitcoinError) {
        snackbar.createSnack(
          'Error validating settings: ' + bitcoinError,
          'error'
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, processing, checkSuccessful, bitcoinError])

  const onSubmit = (config: BitcoinDConfig): void => {
    dispatch(checkRequest(config))
    setSubmitted(true)
  }
  return (
    <WalletSettingsTemplate config={bitcoinConfig} checkSettings={onSubmit} />
  )
}

WalletSettings.defaultProps = {
  onSaved: (): void => void 0,
}

export default WalletSettings
