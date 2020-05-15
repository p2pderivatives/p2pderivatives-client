import { DlcRendererAPI } from './DlcRendererAPI'
import { ContractState } from '../../common/models/dlc/ContractState'
import { GET_CONTRACTS, DLC_EVENT } from '../../common/constants/IPC'
import { GetContractsCall } from '../../common/models/ipc/GetContractsCall'
import {
  GetContractsAnswer,
  GetContractsAnswerProps,
} from '../../common/models/ipc/GetContractsAnswer'
import { Contract } from '../../common/models/dlc/Contract'
import { DlcEventType } from '../../common/constants/DlcEventType'
import { DlcCall } from '../../common/models/ipc/DlcCall'
const { ipcRenderer: ipc } = window.require('electron-better-ipc')

export class DlcIPCRenderer implements DlcRendererAPI {
  dlcCall(type: DlcEventType, contract: Contract): Promise<Contract> {
    const dlcCall: DlcCall = { type: type, contract: contract }
    return ipc.callMain(DLC_EVENT, dlcCall) as Promise<Contract>
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
