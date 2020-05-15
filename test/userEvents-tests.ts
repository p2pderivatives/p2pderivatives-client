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
  LOGIN,
} from '../src/common/constants/IPC'
import {
  RegisterUserProps,
  RegisterUserAnswer,
} from '../src/common/models/ipc/RegisterUserAnswer'
import UserListAnswer, {
  UserListAnswerProps,
} from '../src/common/models/ipc/UserListAnswer'
import { LoginCall } from '../src/common/models/ipc/LoginCall'
import { User } from '../src/common/models/user/User'

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
  @test async ipcCanDeregisterUser() {
    const loginCall = new LoginCall('test', 'test')
    const loginResult = (await ipc.callMain(
      LOGIN,
      loginCall
    )) as GeneralAnswerProps
    const loginAnswer = GeneralAnswer.parse(loginResult)
    expect(loginAnswer.isSuccess()).eq(true)

    const result = (await ipc.callMain(UNREGISTER_USER)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
  }

  @test async ipcCanGetUserList() {
    const loginCall = new LoginCall('test', 'test')
    const loginResult = (await ipc.callMain(
      LOGIN,
      loginCall
    )) as GeneralAnswerProps
    const loginAnswer = GeneralAnswer.parse(loginResult)
    expect(loginAnswer.isSuccess()).eq(true)

    const result = (await ipc.callMain(GET_USERLIST)) as UserListAnswerProps
    const answer = UserListAnswer.parse(result)
    const users = answer.getUserList().map(userJson => new User(userJson._name))
    console.log('users: ', users)

    expect(users.length).eq(4)
    expect(users[0].getName()).eq('user1')
  }
}
