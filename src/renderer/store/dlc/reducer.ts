import { Reducer } from 'redux'
import { DlcState, DlcActionTypes } from './types'
import { ContractSimple } from '../../../common/models/ipc/ContractSimple'
import { DlcAnswer } from '../../../common/models/ipc/DlcAnswer'

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
      console.log('Getting contracts')
      console.log(action.payload)
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
      const updatedContract = action.payload as ContractSimple
      const newContracts = Object.assign(
        [],
        state.contracts
      ) as ContractSimple[]
      console.log(newContracts)
      const contractIndex = state.contracts.findIndex(
        c => c.id === updatedContract.id
      )
      if (contractIndex >= 0) newContracts[contractIndex] = updatedContract
      else newContracts.push(updatedContract)
      console.log(newContracts)
      console.log('RETURNING')
      console.log(state)
      const newState = Object.assign({}, state, {
        contracts: newContracts,
        processing: false,
        actionSuccess: true,
      })
      console.log(newState)
      return newState
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
      const newContracts = Object.assign(
        [],
        state.contracts
      ) as ContractSimple[]
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
