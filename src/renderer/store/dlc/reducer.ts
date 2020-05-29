import { Reducer } from 'redux'
import { DlcState, DlcActionTypes } from './types'
import { ContractSimple } from '../../../common/models/ipc/ContractSimple'

export const initialState: DlcState = {
  contracts: [],
  processing: false,
  actionSuccess: false,
  error: undefined,
}

const reducer: Reducer<DlcState> = (state: DlcState = initialState, action) => {
  switch (action.type) {
    case DlcActionTypes.CONTRACT_REQUEST: {
      return { ...state, processing: true }
    }
    case DlcActionTypes.CONTRACT_SUCCESS: {
      return { ...state, processing: false, contracts: action.payload }
    }
    case DlcActionTypes.CONTRACT_ERROR: {
      return {
        ...state,
        processing: false,
        error: action.payload,
      }
    }
    case DlcActionTypes.OFFER_REQUEST:
    case DlcActionTypes.ACCEPT_REQUEST:
    case DlcActionTypes.REJECT_REQUEST: {
      return { ...state, processing: true }
    }
    case DlcActionTypes.DLC_ACTION_SUCCESS: {
      const updatedContract = action.payload as ContractSimple
      const newContracts = state.contracts
      const contractIndex = state.contracts.findIndex(
        c => c.id === updatedContract.id
      )
      if (contractIndex >= 0) newContracts[contractIndex] = updatedContract
      else newContracts.push(updatedContract)
      return {
        ...state,
        contracts: newContracts,
        processing: false,
        actionSuccess: true,
      }
    }
    case DlcActionTypes.DLC_ACTION_ERROR: {
      return {
        ...state,
        processing: false,
        actionSuccess: false,
        error: action.payload,
      }
    }
    case DlcActionTypes.DLC_UPDATE: {
      const updatedContract = action.payload as ContractSimple
      const newContracts = state.contracts
      const contractIndex = state.contracts.findIndex(
        c => c.id === updatedContract.id
      )
      if (contractIndex >= 0) newContracts[contractIndex] = updatedContract
      else newContracts.push(updatedContract)
      return { ...state, contracts: newContracts }
    }
    default: {
      return state
    }
  }
}

export { reducer as dlcReducer }
