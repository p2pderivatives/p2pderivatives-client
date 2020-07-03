import { DlcRendererAPI } from './DlcRendererAPI'
import { ContractState } from '../../common/models/dlc/ContractState'
import {
  GET_CONTRACTS,
  DLC_EVENT,
  OFFER_CONTRACT,
} from '../../common/constants/IPC'
import { GetContractsCall } from '../../common/models/ipc/GetContractsCall'
import {
  GetContractsAnswer,
  GetContractsAnswerProps,
} from '../../common/models/ipc/GetContractsAnswer'
import { DlcEventType } from '../../common/constants/DlcEventType'
import { DlcCall } from '../../common/models/ipc/DlcCall'
import { Contract } from '../../common/models/dlc/Contract'
import { DlcAnswer, DlcAnswerProps } from '../../common/models/ipc/DlcAnswer'
const { ipcRenderer: ipc } = window.require('electron-better-ipc')

export class DlcIPCRenderer implements DlcRendererAPI {
  dlcCall(type: DlcEventType, contractId: string): Promise<DlcAnswer> {
    const dlcCall: DlcCall = { type: type, contractId: contractId }
    return ipc.callMain(DLC_EVENT, dlcCall) as Promise<DlcAnswer> //TODO get answer instead of ContractSimple
  }

  async offerContract(contract: Contract): Promise<DlcAnswer> {
    const answerProps = (await ipc.callMain(
      OFFER_CONTRACT,
      contract
    )) as DlcAnswerProps

    return DlcAnswer.parse(answerProps)
  }

  async getContracts(
    id?: string | null,
    state?: ContractState | null,
    counterPartyName?: string | null
  ): Promise<Contract[]> {
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
