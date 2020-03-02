import { LOGIN, LOGOUT } from '../../common/constants/IPC'
import { LoginCall } from '../../common/models/ipc/LoginCall'
import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../../common/models/ipc/GeneralAnswer'
import { AuthenticationAPI } from './AuthenticationAPI'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer: ipc } = window.require('electron-better-ipc')

export class AuthenticationIPC implements AuthenticationAPI {
  public async login(username: string, password: string): Promise<void> {
    const answerProps = (await ipc.callMain(
      LOGIN,
      new LoginCall(username, password)
    )) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(answerProps)
    if (!answer.isSuccess()) {
      // TODO: transform exceptions if needed into more front-end friendly messages
      const error = answer.getError()
      if (error) {
        throw new Error(error.getMessage())
      } else {
        throw new Error('Unknown error ocurred.')
      }
    }
  }

  public async logout(): Promise<void> {
    const answerProps = (await ipc.callMain(LOGOUT)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(answerProps)

    if (!answer.isSuccess()) {
      const error = answer.getError()
      if (error) {
        throw new Error(error.getMessage())
      } else {
        throw new Error('Unknown error ocurred.')
      }
    }
  }
}
