import { LoginCall } from '../../common/models/ipc/LoginCall'
import { ChangePasswordCall } from '../../common/models/ipc/ChangePasswordCall'
import { GrpcClient } from '../api/grpc/GrpcClient'
import { ipcMain as ipc } from 'electron-better-ipc'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { IPCEvents } from '../../common/models/ipc/IPCEvents'
import {
  LOGIN,
  LOGOUT,
  REFRESH,
  CHANGE_PASSWORD,
  GET_USER,
} from '../../common/constants/IPC'
import { UserAnswer } from '../../common/models/ipc/UserAnswerProps'
import { IPCError } from '../../common/models/ipc/IPCError'

export class AuthenticationEvents implements IPCEvents {
  private _client: GrpcClient
  private _loginCallback: (userName: string) => Promise<void>
  private _logoutCallback: () => Promise<void>

  public constructor(
    client: GrpcClient,
    loginCallback: (userName: string) => Promise<void>,
    logoutCallback: () => Promise<void>
  ) {
    this._client = client
    this._loginCallback = loginCallback
    this._logoutCallback = logoutCallback
  }

  public registerReplies(): void {
    console.log('REGISTERING REPLIES')
    ipc.answerRenderer(LOGIN, async data => {
      console.log('Requesting login')
      const request = data as LoginCall
      try {
        await this._client
          .getAuthenticationService()
          .login(request.username, request.password)
        await this._loginCallback(request.username)
        return new GeneralAnswer(true)
      } catch (e) {
        return new GeneralAnswer(false, e)
      }
    })

    ipc.answerRenderer(LOGOUT, async data => {
      try {
        await this._client.getAuthenticationService().logout()
        await this._logoutCallback()
        return new GeneralAnswer(true)
      } catch (e) {
        return new GeneralAnswer(false, e)
      }
    })

    ipc.answerRenderer(REFRESH, async data => {
      try {
        await this._client.getAuthenticationService().refresh()
        return new GeneralAnswer(true)
      } catch (e) {
        return new GeneralAnswer(false, e)
      }
    })

    ipc.answerRenderer(CHANGE_PASSWORD, async data => {
      const request = data as ChangePasswordCall
      try {
        await this._client
          .getAuthenticationService()
          .changePassword(request.oldPassword, request.newPassword)
        return new GeneralAnswer(true)
      } catch (e) {
        return new GeneralAnswer(false, e)
      }
    })

    ipc.answerRenderer(GET_USER, async data => {
      const username = this._client.getAuthObject().getUsername()
      if (username) {
        return new UserAnswer(true, username)
      } else {
        return new UserAnswer(
          false,
          '',
          new IPCError('general', -1, 'Not logged in!', 'AuthenticationError')
        )
      }
    })
  }
}
