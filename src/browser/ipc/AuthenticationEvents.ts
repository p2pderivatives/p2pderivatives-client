import { LoginCall } from '../../common/models/ipc/LoginCall'
import { GrpcClient } from '../api/grpc/GrpcClient'
import { ipcMain as ipc } from 'electron-better-ipc'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { IPCEvents } from './IPCEvents'
import { LOGIN, LOGOUT } from '../../common/constants/IPC'

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
  }
}
