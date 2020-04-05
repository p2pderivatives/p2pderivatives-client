import { expect } from 'chai'
import { test, suite } from '@testdeck/mocha'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../src/common/models/ipc/GeneralAnswer'
import { RegisterUserCall } from '../src/common/models/ipc/RegisterUserCall'
import { REGISTER_USER, UNREGISTER_USER } from '../src/common/constants/IPC'
import {
  RegisterUserProps,
  RegisterUserAnswer,
} from '../src/common/models/ipc/RegisterUserAnswer'

@suite('IPC-User')
class Main {
  @test async ipcCanRegisterUser() {
    const registerCall = new RegisterUserCall('test', 'test')
    const result = (await ipc.callMain(
      REGISTER_USER,
      registerCall
    )) as RegisterUserProps
    const answer = RegisterUserAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
    expect(answer.getId()).eq('1')
    expect(answer.getName()).eq('test')
  }

  @test async ipcCanDeregisterUser() {
    const result = (await ipc.callMain(UNREGISTER_USER)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
  }
}
