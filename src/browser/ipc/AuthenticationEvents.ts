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
} from '../../common/constants/IPC'

export class AuthenticationEvents implements IPCEvents {
  private _client: GrpcClient

  public constructor(client: GrpcClient) {
    this._client = client
  }

  public registerReplies(): void {
    ipc.answerRenderer(LOGIN, async data => {
      const request = data as LoginCall
      try {
        await this._client
          .getAuthenticationService()
          .login(request.username, request.password)
        return new GeneralAnswer(true)
      } catch (e) {
        return new GeneralAnswer(false, e)
      }
    })

    ipc.answerRenderer(LOGOUT, async data => {
      try {
        await this._client.getAuthenticationService().logout()
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
  }
}
