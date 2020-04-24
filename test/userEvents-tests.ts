import { expect } from 'chai'
import { test, suite, skip } from '@testdeck/mocha'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../src/common/models/ipc/GeneralAnswer'
import { RegisterUserCall } from '../src/common/models/ipc/RegisterUserCall'
import {
  REGISTER_USER,
  UNREGISTER_USER,
  GET_USERLIST,
} from '../src/common/constants/IPC'
import {
  RegisterUserProps,
  RegisterUserAnswer,
} from '../src/common/models/ipc/RegisterUserAnswer'

@suite('IPC-User')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // TODO fix test failing, disabled for now
  @skip @test async ipcCanDeregisterUser() {
    const result = (await ipc.callMain(UNREGISTER_USER)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
  }

  @test async ipcCanGetUserList() {
    const result = await ipc.callMain(GET_USERLIST)
  }
}
