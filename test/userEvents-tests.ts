import { expect } from 'chai'
import { test, suite } from '@testdeck/mocha'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../src/common/models/ipc/GeneralAnswer'
import { IPCError } from '../src/common/models/ipc/IPCError'
import { RegisterUserCall } from '../src/common/models/ipc/RegisterUserCall'
import {
  REGISTER_USER,
  UNREGISTER_USER,
  SEND_USER,
  SEND_USER_END,
  GET_USERLIST,
} from '../src/common/constants/IPC'
import {
  RegisterUserProps,
  RegisterUserAnswer,
} from '../src/common/models/ipc/RegisterUserAnswer'
import { User, UserProps } from '../src/common/models/user/User'
import { LoginCall } from '../src/common/models/ipc/LoginCall'

@suite('IPC-User')
class Main {

  @test async ipcCanRegisterUser() {
    const registerCall = new RegisterUserCall('test', 'test', 'test')
    const result = (await ipc.callMain(
      REGISTER_USER,
      registerCall
    )) as RegisterUserProps
    const answer = RegisterUserAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
    expect(answer.getId()).eq('1')
    expect(answer.getAccount()).eq('test')
    expect(answer.getName()).eq('test')
  }

  @test async ipcCanDeregisterUser() {
    const result = (await ipc.callMain(UNREGISTER_USER)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
  }
}
