import {
  CHANGE_PASSWORD,
  GET_USER,
  LOGIN,
  LOGOUT,
  REFRESH,
} from '../../common/constants/IPC'
import { ChangePasswordCall } from '../../common/models/ipc/ChangePasswordCall'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { IPCError } from '../../common/models/ipc/IPCError'
import { LoginCall } from '../../common/models/ipc/LoginCall'
import { UserAnswer } from '../../common/models/ipc/UserAnswerProps'
import { GrpcClient } from '../api/grpc/GrpcClient'
import { GrpcError } from '../api/grpc/GrpcError'
import { IPCEventsBase } from './IPCEventsBase'
import { TaggedCallback } from './TaggedCallback'

export class AuthenticationEvents extends IPCEventsBase {
  private _client: GrpcClient
  private _loginCallback: (userName: string) => Promise<() => Promise<void>>
  private _logoutCallback: () => Promise<void> = (): Promise<void> =>
    Promise.resolve()

  public constructor(
    client: GrpcClient,
    loginCallback: (userName: string) => Promise<() => Promise<void>>
  ) {
    super()
    this._client = client
    this._loginCallback = loginCallback
  }

  public async logout(): Promise<void> {
    await this._client.getAuthenticationService().logout()
    await this._logoutCallback()
  }

  protected taggedCallbacks(): TaggedCallback[] {
    return [
      {
        tag: LOGIN,
        callback: (data): Promise<GeneralAnswer> => this.loginCallback(data),
      },
      {
        tag: LOGOUT,
        callback: (): Promise<GeneralAnswer> => this.logoutIPCCallback(),
      },
      {
        tag: REFRESH,
        callback: (): Promise<GeneralAnswer> => this.refreshCallback(),
      },
      {
        tag: CHANGE_PASSWORD,
        callback: (data): Promise<GeneralAnswer> =>
          this.changePasswordCallback(data),
      },
      {
        tag: GET_USER,
        callback: (): Promise<UserAnswer> => this.getUserCallback(),
      },
    ]
  }

  private async loginCallback(data: unknown): Promise<GeneralAnswer> {
    const request = data as LoginCall
    try {
      await this._client
        .getAuthenticationService()
        .login(request.username, request.password)
      this._logoutCallback = await this._loginCallback(request.username)
      return new GeneralAnswer(true)
    } catch (e) {
      const ipcError =
        e instanceof IPCError || e instanceof GrpcError
          ? (e as IPCError)
          : new IPCError('Login error', -1, e.message, 'Login Error')
      return new GeneralAnswer(false, ipcError)
    }
  }

  private async logoutIPCCallback(): Promise<GeneralAnswer> {
    try {
      await this.logout()
      return new GeneralAnswer(true)
    } catch (e) {
      return new GeneralAnswer(false, e)
    }
  }

  private async refreshCallback(): Promise<GeneralAnswer> {
    try {
      await this._client.getAuthenticationService().refresh()
      return new GeneralAnswer(true)
    } catch (e) {
      return new GeneralAnswer(false, e)
    }
  }

  private async changePasswordCallback(data: unknown): Promise<GeneralAnswer> {
    const request = data as ChangePasswordCall
    try {
      await this._client
        .getAuthenticationService()
        .changePassword(request.oldPassword, request.newPassword)
      return new GeneralAnswer(true)
    } catch (e) {
      return new GeneralAnswer(false, e)
    }
  }

  private async getUserCallback(): Promise<UserAnswer> {
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
  }
}
