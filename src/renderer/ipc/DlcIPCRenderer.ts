import { DlcRendererAPI } from './DlcRendererAPI'
import { ContractState } from '../../common/models/dlc/ContractState'
import { GET_CONTRACTS, DLC_EVENT, OFFER_CONTRACT } from '../../common/constants/IPC'
import { GetContractsCall } from '../../common/models/ipc/GetContractsCall'
import {
  GetContractsAnswer,
  GetContractsAnswerProps,
} from '../../common/models/ipc/GetContractsAnswer'
import { DlcEventType } from '../../common/constants/DlcEventType'
import { DlcCall } from '../../common/models/ipc/DlcCall'
import { ContractSimple } from '../../common/models/ipc/ContractSimple'
import { ContractOfferCall } from '../../common/models/ipc/ContractOfferCall'
const { ipcRenderer: ipc } = window.require('electron-better-ipc')

export class DlcIPCRenderer implements DlcRendererAPI {
  dlcCall(type: DlcEventType, contractId: string): Promise<ContractSimple> {
    const dlcCall: DlcCall = { type: type, contractId: contractId }
    return ipc.callMain(DLC_EVENT, dlcCall) as Promise<ContractSimple>  //TODO get answer instead of ContractSimple
  }

  offerContract(contract: ContractSimple): Promise<ContractSimple> {
    const offerCall: ContractOfferCall = { contract: contract }
    return ipc.callMain(OFFER_CONTRACT, offerCall) as Promise<ContractSimple> //TODO get answer instead of ContractSimple
  }

  async getContracts(
    id?: string | null,
    state?: ContractState | null,
    counterPartyName?: string | null
  ): Promise<ContractSimple[]> {
    const answerProps = (await ipc.callMain(GET_CONTRACTS, {
      id,
      state,
      counterPartyName,
    } as GetContractsCall)) as GetContractsAnswerProps
    const answer = GetContractsAnswer.parse(answerProps)

    if (!answer.isSuccess()) {
      const error = answer.getError()
      throw error
    }

    return answer.getContracts()
  }
}
