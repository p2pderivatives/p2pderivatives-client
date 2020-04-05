import { RegisterUserCall } from '../../common/models/ipc/RegisterUserCall'
import {
  REGISTER_USER,
  UNREGISTER_USER,
  GET_USERLIST,
  SEND_USER,
  SEND_USER_END,
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

  public async getUserList(): Promise<Subject<UserInfo>> {
    const answerProps = (await ipc.callMain(GET_USERLIST)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(answerProps)

    if (answer.isSuccess()) {
      this._userListObservable = new Subject<UserInfo>()
      this._unregisterUserList = ipc.answerMain(SEND_USER, (data: UserInfo) => {
        const userInfo = data as UserInfo
        if (this._userListObservable) {
          this._userListObservable.next(userInfo)
        }
      })
      this._unregisterUserListEnd = ipc.answerMain(
        SEND_USER_END,
        (data: any) => {
          if (this._userListObservable) {
            this._userListObservable.complete()
          }
          if (this._unregisterUserList) {
            this._unregisterUserList()
          }
          if (this._unregisterUserListEnd) {
            this._unregisterUserListEnd()
          }
        }
      )
      return this._userListObservable
    } else {
      const error = answer.getError()
      throw error
    }
  }
}
