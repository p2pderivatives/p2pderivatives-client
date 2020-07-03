import { Reducer } from 'redux'
import { DlcState, DlcActionTypes } from './types'
import { Contract } from '../../../common/models/dlc/Contract'

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
      const newState = Object.assign({}, state)
      return { ...newState, processing: false, contracts: action.payload }
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
      const updatedContract = action.payload as Contract
      const newContracts = Object.assign([], state.contracts) as Contract[]
      const contractIndex = state.contracts.findIndex(
        c => c.id === updatedContract.id
      )
      if (contractIndex >= 0) newContracts[contractIndex] = updatedContract
      else newContracts.push(updatedContract)
      const newState = Object.assign({}, state, {
        contracts: newContracts,
        processing: false,
        actionSuccess: true,
      })
      return newState
    }
    case DlcActionTypes.DLC_ACTION_ERROR: {
      const payload = action.payload as { error: string; contract?: Contract }
      let newContracts = state.contracts
      const updatedContract = payload.contract
      if (updatedContract) {
        newContracts = Object.assign([], state.contracts) as Contract[]
        const contractIndex = state.contracts.findIndex(
          c => c.id === updatedContract.id
        )
        if (contractIndex >= 0) newContracts[contractIndex] = updatedContract
        else newContracts.push(updatedContract)
      }
      const newState = Object.assign({}, state, {
        contracts: newContracts,
        processing: false,
        actionSuccess: false,
        error: payload.error,
      })
      return newState
    }
    case DlcActionTypes.DLC_UPDATE: {
      const updatedContract = action.payload as Contract
      const newContracts = Object.assign([], state.contracts) as Contract[]
      const contractIndex = state.contracts.findIndex(
        c => c.id === updatedContract.id
      )
      if (contractIndex >= 0) newContracts[contractIndex] = updatedContract
      else newContracts.push(updatedContract)
      return { ...state, contracts: newContracts }
    }
    case DlcActionTypes.DLC_SELECT: {
      const contract = action.payload as Contract
      return {
        ...state,
        selectedContract: contract,
      }
    }
    default: {
      return state
    }
  }
}

export { reducer as dlcReducer }
