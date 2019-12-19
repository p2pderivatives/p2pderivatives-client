import { expect } from 'chai'
import { test, suite } from '@testdeck/mocha'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import { LoginCall } from '../src/common/models/ipc/LoginCall'
import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../src/common/models/ipc/GeneralAnswer'
import { IPCError } from '../src/common/models/ipc/IPCError'
import { LOGIN, LOGOUT } from '../src/common/constants/IPC'

@suite('IPC-Auth')
class Main {
  @test async ipcLoginShouldSucceed() {
    const loginCall = new LoginCall('test', 'test')
    const result = (await ipc.callMain(LOGIN, loginCall)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
    expect(answer.getError()).eq(null)
  }

  @test async ipcLoginFailsWithWrongPassword() {
    const loginCall = new LoginCall('error', 'test')
    const result = (await ipc.callMain(LOGIN, loginCall)) as GeneralAnswerProps
    console.log('result: ', result)
    const answer = GeneralAnswer.parse(result)

    expect(answer.isSuccess()).eq(false)
    expect(answer.getError()).instanceOf(IPCError)
    const error = answer.getError()
    if (error) {
      expect(error.getCode()).eq(17)
    }
  }

  @test async ipcLogoutShouldSucceed() {
    const result = (await ipc.callMain(LOGOUT)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
  }
}
