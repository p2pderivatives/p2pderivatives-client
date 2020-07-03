import React, { FC, useEffect, useState } from 'react'
import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'
import { ApplicationState } from '../../../store'

import ContractListTemplate from '../../templates/ContractListTemplate'
import {
  contractRequest,
  dlcSelectContract,
  dlcActionError,
} from '../../../store/dlc/actions'
import { push } from 'connected-react-router'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { useSnackbar } from '../../../providers/Snackbar'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const contractOfferErrorMsg =
  'Could not offer contract. You can try again by clicking on the failed contract.'

const ContractOverviewPage: FC = () => {
  const dispatch = useDispatch()
  const contracts = useSelector(state => state.dlc.contracts)
  const username = useSelector(state => state.login.username)
  const dlcError = useSelector(state => state.dlc.error)
  const [displayError, setDisplayError] = useState(true)
  const snackbar = useSnackbar()

  useEffect(() => {
    dispatch(dlcSelectContract())
    dispatch(contractRequest())
    if (displayError && dlcError) {
      snackbar.createSnack(contractOfferErrorMsg, 'error')
      setDisplayError(false)
    }
    dispatch(dlcActionError({ error: '' }))
  }, [displayError, dlcError, snackbar, dispatch])

  const handleContractClicked = (id: string): void => {
    const contract = contracts.find(x => x.id === id)
    if (!contract) {
      return // Should not happen
    }

    dispatch(dlcSelectContract(contract))

    if (contract.state === ContractState.Failed) {
      dispatch(push('/new-contract' + id))
    } else {
      dispatch(push('/contract/' + id))
    }
  }

  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <ContractListTemplate
        username={username}
        data={contracts}
        onContractClicked={handleContractClicked}
      />
    </div>
  )
}

export default ContractOverviewPage
