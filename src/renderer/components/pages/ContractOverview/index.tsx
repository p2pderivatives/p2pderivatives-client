import React, { FC, useEffect } from 'react'
import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'
import { ApplicationState } from '../../../store'

import ContractListTemplate from '../../templates/ContractListTemplate'
import { contractRequest } from '../../../store/dlc/actions'
import { push } from 'connected-react-router'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const ContractOverviewPage: FC = () => {
  const dispatch = useDispatch()
  const contracts = useSelector(state => state.dlc.contracts)
  const username = useSelector(state => state.login.username)

  useEffect(() => {
    console.log('dispatching contract request')
    dispatch(contractRequest())
  }, [])

  const handleContractClicked = (id: string): void => {
    dispatch(push('/contract/' + id))
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
