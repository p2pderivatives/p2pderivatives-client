import React, { FC, useEffect } from 'react'
import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'
import { ApplicationState } from '../../../store'

import ContractDetailTemplate from '../../templates/ContractDetailTemplate'
import { goBack } from 'connected-react-router'
import { RouteChildrenProps } from 'react-router'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { acceptRequest, rejectRequest } from '../../../store/dlc/actions'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const ContractDetailPage: FC<RouteChildrenProps<{ id: string }>> = (
  props: RouteChildrenProps<{ id: string }>
) => {
  const contractId = props.match ? props.match.params.id : ''
  const dispatch = useDispatch()
  const contracts = useSelector(state => state.dlc.contracts)
  const contract = contracts.find(c => c.id === contractId)
  const username = useSelector(state => state.login.username)

  useEffect(() => {
    if (!contract) {
      dispatch(goBack())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract])

  const handleAccept = (): void => {
    if (contract) dispatch(acceptRequest(contract.id))
  }

  const handleReject = (): void => {
    if (contract) dispatch(rejectRequest(contract.id))
  }

  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      {contract !== undefined && (
        <ContractDetailTemplate
          data={contract}
          isProposal={
            contract.state === ContractState.Offered &&
            contract.counterPartyName === username
          }
          acceptContract={handleAccept}
          rejectContract={handleReject}
        />
      )}
    </div>
  )
}

export default ContractDetailPage
