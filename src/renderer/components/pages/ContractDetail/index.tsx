import { push } from 'connected-react-router'
import React, { FC, useEffect, useState } from 'react'
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector as useReduxSelector,
} from 'react-redux'
import { RouteChildrenProps } from 'react-router'
import { isFailed } from '../../../../common/utils/failable'
import { BitcoinIPC } from '../../../ipc/consumer/BitcoinIPC'
import { ApplicationState } from '../../../store'
import { acceptRequest, rejectRequest } from '../../../store/dlc/actions'
import ContractDetailTemplate from '../../templates/ContractDetailTemplate'

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector
const bitcoinIPC = new BitcoinIPC()

const ContractDetailPage: FC<RouteChildrenProps<{ id: string }>> = (
  props: RouteChildrenProps<{ id: string }>
) => {
  const dispatch = useDispatch()
  const contractId = props.match ? props.match.params.id : ''
  const contracts = useSelector(state => state.dlc.contracts)
  const contract = contracts.find(c => c.id === contractId)

  const [availableAmount, setAvailableAmount] = useState(0)

  const getUtxoAmount = async (): Promise<void> => {
    const res = await bitcoinIPC.events.getUtxoAmount()
    if (isFailed(res)) {
      throw res.error
    }
    setAvailableAmount(res.value)
  }

  useEffect(() => {
    getUtxoAmount()
  }, [])

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
          availableAmount={availableAmount}
        />
      )}
    </div>
  )
}

export default ContractDetailPage
