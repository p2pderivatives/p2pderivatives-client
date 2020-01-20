import { ipcRenderer as ipc } from 'electron-better-ipc'
import { RegisterUserCall } from '../../common/models/ipc/RegisterUserCall'
import {
  REGISTER_USER,
  UNREGISTER_USER,
  GET_USERLIST,
  SEND_USER,
  SEND_USER_END,
} from '../../common/constants/IPC'
import { RegisterUserAnswer } from '../../common/models/ipc/RegisterUserAnswer'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { Subject } from 'rxjs'
import { UserInfo } from '../../browser/api/grpc/gen/user_pb'
import { UserAPI } from './UserAPI'

export class UserIPC implements UserAPI {
  private _unregisterUserList: (() => void) | null = null
  private _unregisterUserListEnd: (() => void) | null = null
  private _userListObservable: Subject<UserInfo> | null = null

  public async registerUser(password: string, name: string): Promise<string> {
    const call = new RegisterUserCall(password, name)

    const answer = (await ipc.callMain(
      REGISTER_USER,
      call
    )) as RegisterUserAnswer

    if (answer.isSuccess()) {
      return answer.getId()
    } else {
      throw new Error(answer.getError()?.getMessage())
    }
  }

  public async unregisterUser(): Promise<void> {
    const answer = (await ipc.callMain(UNREGISTER_USER)) as GeneralAnswer

    if (!answer.isSuccess) {
      // TODO: transform exceptions if needed into more front-end friendly messages
      throw new Error(answer.getError()?.getMessage())
    }
  }

  public async getUserList(): Promise<Subject<UserInfo>> {
    const answer = (await ipc.callMain(GET_USERLIST)) as GeneralAnswer

    if (answer.isSuccess()) {
      this._userListObservable = new Subject<UserInfo>()
      this._unregisterUserList = ipc.answerMain(SEND_USER, data => {
        const userInfo = data as UserInfo
        if (this._userListObservable) {
          this._userListObservable.next(userInfo)
        }
      })
      this._unregisterUserListEnd = ipc.answerMain(SEND_USER_END, data => {
        if (this._userListObservable) {
          this._userListObservable.complete()
        }
        if (this._unregisterUserList) {
          this._unregisterUserList()
        }
        if (this._unregisterUserListEnd) {
          this._unregisterUserListEnd()
        }
      })
      return this._userListObservable
    } else {
      throw new Error(answer.getError()?.getMessage())
    }
  }
}
