import { IPCEventRegisterBase } from '../../../common/ipc/BaseIPC'
import { TaggedCallbacks } from '../../../common/ipc/IPC'
import {
  AuthChannels,
  AuthFailableAsync,
  ChangePasswordCall,
  LoginCall,
} from '../../../common/ipc/model/authentication'
import { Success } from '../../../common/utils/failable'
import { GrpcClient } from '../../api/grpc/GrpcClient'

export class AuthenticationEvents extends IPCEventRegisterBase<AuthChannels> {
  protected taggedCallbacks: TaggedCallbacks<AuthChannels> = {
    login: {
      tag: 'auth/login',
      callback: this.loginCallback.bind(this),
    },
    logout: {
      tag: 'auth/logout',
      callback: this.logoutCallback.bind(this),
    },
    changePassword: {
      tag: 'auth/password/update',
      callback: this.changePasswordCallback.bind(this),
    },
    refresh: {
      tag: 'auth/refresh',
      callback: this.refreshCallback.bind(this),
    },
    getUser: {
      tag: 'auth/user/get',
      callback: this.getUserCallback.bind(this),
    },
  }
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
    try {
      await this._client.getAuthenticationService().logout()
    } finally {
      await this._logoutCallback()
    }
  }

  private async loginCallback(request: LoginCall): AuthFailableAsync<void> {
    try {
      await this._client
        .getAuthenticationService()
        .login(request.username, request.password)
      this._logoutCallback = await this._loginCallback(request.username)
      return Success()
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'authentication',
          code: -1,
          message: e.message,
          name: 'Login Error',
        },
      }
    }
  }

  private async logoutCallback(): AuthFailableAsync<void> {
    try {
      await this.logout()
      return {
        success: true,
      }
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'authentication',
          code: -2,
          message: e.message,
          name: 'Logout Error',
        },
      }
    }
  }

  private async refreshCallback(): AuthFailableAsync<void> {
    try {
      await this._client.getAuthenticationService().refresh()
      return { success: true }
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'authentication',
          code: -3,
          message: e.message,
          name: 'Refresh Error',
        },
      }
    }
  }

  private async changePasswordCallback(
    request: ChangePasswordCall
  ): AuthFailableAsync<void> {
    try {
      await this._client
        .getAuthenticationService()
        .changePassword(request.oldPassword, request.newPassword)
      return {
        success: true,
      }
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'authentication',
          code: -4,
          message: e.message,
          name: 'ChangePassword Error',
        },
      }
    }
  }

  private async getUserCallback(): AuthFailableAsync<string> {
    const username = this._client.getAuthObject().getUsername()
    if (username) {
      return {
        success: true,
        value: username,
      }
    } else {
      return {
        success: false,
        error: {
          type: 'authentication',
          code: -5,
          message: 'Not logged in!',
          name: 'Get User Error',
        },
      }
    }
  }
}
