import { expect } from 'chai'
import { test, suite } from '@testdeck/mocha'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../src/common/models/ipc/GeneralAnswer'
import { DlcCall } from './common/models/ipc/DlcCall'
import { DLC_EVENT, GET_CONTRACTS } from '../src/common/constants/IPC'
import { GetContractsCall } from '../src/common/models/ipc/GetContractsCall'
import { ContractTest } from './Consts'
import {
  GetContractsAnswer,
  GetContractsAnswerProps,
} from '../src/common/models/ipc/GetContractsAnswer'
import { DlcEventType } from '../src/common/constants/DlcEventType'

@suite('IPC-DLC')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Main {
  @test async ipcOfferContractShouldSucceed(): Promise<void> {
    const result = (await ipc.callMain(DLC_EVENT, {
      type: DlcEventType.Offer,
      contract: ContractTest,
    } as DlcCall)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
    expect(answer.getError()).eq(null)
  }

  @test async ipcAcceptContractShouldSucceed(): Promise<void> {
    const result = (await ipc.callMain(DLC_EVENT, {
      type: DlcEventType.Accept,
      contract: ContractTest,
    } as DlcCall)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
    expect(answer.getError()).eq(null)
  }

  @test async ipcGetContractsShouldSucceed(): Promise<void> {
    const result = (await ipc.callMain(GET_CONTRACTS, {
      id: '1',
      counterPartyName: 'Bob',
    } as GetContractsCall)) as GetContractsAnswerProps

    const answer = GetContractsAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
    expect(answer.getError()).eq(null)
  }
}
