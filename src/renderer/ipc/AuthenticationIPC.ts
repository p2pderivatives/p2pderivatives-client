import { ipcRenderer as ipc } from 'electron-better-ipc'
import { LOGIN, LOGOUT } from '../../common/constants/IPC'
import { LoginCall } from '../../common/models/ipc/LoginCall'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { AuthenticationAPI } from './AuthenticationAPI'

export class AuthenticationIPC implements AuthenticationAPI {
  public async login(username: string, password: string): Promise<void> {
    const answer = (await ipc.callMain(
      LOGIN,
      new LoginCall(username, password)
    )) as GeneralAnswer

    if (!answer.isSuccess) {
      // TODO: transform exceptions if needed into more front-end friendly messages
      throw new Error(answer.getError()?.getMessage())
    }
  }

  public async logout(): Promise<void> {
    const answer = (await ipc.callMain(LOGOUT)) as GeneralAnswer

    if (!answer.isSuccess) {
      throw new Error(answer.getError()?.getMessage())
    }
  }
}
