import React, { FC, useEffect } from 'react'
import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'
import { ApplicationState } from '../../../store'

import ContractDetailTemplate from '../../templates/ContractDetailTemplate'
import { push } from 'connected-react-router'
import { RouteChildrenProps } from 'react-router'
import { acceptRequest, rejectRequest } from '../../../store/dlc/actions'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const ContractDetailPage: FC<RouteChildrenProps<{ id: string }>> = (
  props: RouteChildrenProps<{ id: string }>
) => {
  const dispatch = useDispatch()
  const contractId = props.match ? props.match.params.id : ''
  const contracts = useSelector(state => state.dlc.contracts)
  const contract = contracts.find(c => c.id === contractId)

  // const username = useSelector(state => state.login.username)

  useEffect(() => {
    if (!contract) {
      dispatch(push('/main'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract])

  const handleAccept = (): void => {
    if (contract && contract.id) dispatch(acceptRequest(contract.id))
    dispatch(push('/main'))
  }

  const handleReject = (): void => {
    if (contract && contract.id) dispatch(rejectRequest(contract.id))
    dispatch(push('/main'))
  }

  const handleCancel = (): void => {
    dispatch(push('/main'))
  }

  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      {contract !== undefined && (
        <ContractDetailTemplate
          data={contract}
          acceptContract={handleAccept}
          rejectContract={handleReject}
          cancel={handleCancel}
        />
      )}
    </div>
  )
}

export default ContractDetailPage
