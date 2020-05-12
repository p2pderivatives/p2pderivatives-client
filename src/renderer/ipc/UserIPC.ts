import { RegisterUserCall } from '../../common/models/ipc/RegisterUserCall'
import {
  REGISTER_USER,
  UNREGISTER_USER,
  GET_USERLIST,
} from '../../common/constants/IPC'
import {
  RegisterUserAnswer,
  RegisterUserProps,
} from '../../common/models/ipc/RegisterUserAnswer'
import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../../common/models/ipc/GeneralAnswer'
import { Subject } from 'rxjs'
import { UserInfo } from '@internal/gen-grpc/user_pb'
import { UserAPI } from './UserAPI'
import { User } from '../../common/models/user/User'
import UserListAnswer, {
  UserListAnswerProps,
} from '../../common/models/ipc/UserListAnswer'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer: ipc } = window.require('electron-better-ipc')

export class UserIPC implements UserAPI {
  private _unregisterUserList: (() => void) | null = null
  private _unregisterUserListEnd: (() => void) | null = null
  private _userListObservable: Subject<UserInfo> | null = null

  public async registerUser(password: string, name: string): Promise<string> {
    const call = new RegisterUserCall(password, name)

    const answerProps = (await ipc.callMain(
      REGISTER_USER,
      call
    )) as RegisterUserProps
    const answer = RegisterUserAnswer.parse(answerProps)

    if (answer.isSuccess()) {
      return answer.getId()
    } else {
      const error = answer.getError()
      throw error
    }
  }

  public async unregisterUser(): Promise<void> {
    const answerProps = (await ipc.callMain(
      UNREGISTER_USER
    )) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(answerProps)

    if (!answer.isSuccess()) {
      const error = answer.getError()
      throw error
    }
  }

  public async getUserList(): Promise<User[]> {
    const result = (await ipc.callMain(GET_USERLIST)) as UserListAnswerProps
    const answer = UserListAnswer.parse(result)

    if (answer.isSuccess()) {
      const users = answer
        .getUserList()
        .map(userJson => new User(userJson._name))
      return users
    } else {
      const error = answer.getError()
      throw error
    }
  }
}
