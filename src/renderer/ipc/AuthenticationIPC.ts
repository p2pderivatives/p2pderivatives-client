import {
  LOGIN,
  LOGOUT,
  REFRESH,
  CHANGE_PASSWORD,
  GET_USER,
} from '../../common/constants/IPC'
import { LoginCall } from '../../common/models/ipc/LoginCall'
import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../../common/models/ipc/GeneralAnswer'
import { AuthenticationAPI } from './AuthenticationAPI'
import { ChangePasswordCall } from '../../common/models/ipc/ChangePasswordCall'
import {
  UserAnswerProps,
  UserAnswer,
} from '../../common/models/ipc/UserAnswerProps'
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
      throw error
    }
  }

  public async logout(): Promise<void> {
    const answerProps = (await ipc.callMain(LOGOUT)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(answerProps)

    if (!answer.isSuccess()) {
      const error = answer.getError()
      throw error
    }
  }

  public async refresh(): Promise<void> {
    const answerProps = (await ipc.callMain(REFRESH)) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(answerProps)

    if (!answer.isSuccess()) {
      const error = answer.getError()
      throw error
    }
  }

  public async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const call: ChangePasswordCall = { oldPassword, newPassword }
    const answerProps = (await ipc.callMain(
      CHANGE_PASSWORD,
      call
    )) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(answerProps)
    if (!answer.isSuccess()) {
      // TODO: transform exceptions if needed into more front-end friendly messages
      const error = answer.getError()
      throw error
    }
  }

  public async getUser(): Promise<string> {
    const answerProps = (await ipc.callMain(GET_USER)) as UserAnswerProps
    const answer = UserAnswer.parse(answerProps)

    if (answer.isSuccess()) {
      return answer.getUser()
    } else {
      const error = answer.getError()
      throw error
    }
  }
}
