import { DlcEventType } from '../../common/constants/DlcEventType'
import {
  DLC_EVENT,
  GET_CONTRACTS,
  OFFER_CONTRACT,
} from '../../common/constants/IPC'
import { Contract } from '../../common/models/dlc/Contract'
import { DlcAnswer, DlcAnswerProps } from '../../common/models/ipc/DlcAnswer'
import { DlcCall } from '../../common/models/ipc/DlcCall'
import {
  GetContractsAnswer,
  GetContractsAnswerProps,
} from '../../common/models/ipc/GetContractsAnswer'
import { GetContractsCall } from '../../common/models/ipc/GetContractsCall'
import { DlcRendererAPI } from './DlcRendererAPI'
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

  async getContracts(call: GetContractsCall = {}): Promise<Contract[]> {
    const answerProps = (await ipc.callMain(
      GET_CONTRACTS,
      call
    )) as GetContractsAnswerProps
    const answer = GetContractsAnswer.parse(answerProps)

    if (!answer.isSuccess()) {
      const error = answer.getError()
      throw error
    }

    return answer.getContracts()
  }
}
