import { UserInfo } from '@internal/gen-grpc/user_pb'
import { IPCEventRegisterBase } from '../../../common/ipc/BaseIPC'
import { TaggedCallbacks } from '../../../common/ipc/IPC'
import {
  RegisterUserAnswer,
  RegisterUserCall,
  UserChannels,
  UserFailableAsync,
} from '../../../common/ipc/model/user'
import { User } from '../../../common/models/user'
import { Success } from '../../../common/utils/failable'
import { GrpcClient } from '../../api/grpc/GrpcClient'

export class UserEvents extends IPCEventRegisterBase<UserChannels> {
  private _client: GrpcClient

  public constructor(client: GrpcClient) {
    super()
    this._client = client
  }

  protected taggedCallbacks: TaggedCallbacks<UserChannels> = {
    register: {
      tag: 'user/register',
      callback: this.registerUserCallback.bind(this),
    },
    unregister: {
      tag: 'user/unregister',
      callback: this.unregisterUserCallback.bind(this),
    },
    getAllUsers: {
      tag: 'user/list/get',
      callback: this.getUserListCallback.bind(this),
    },
  }

  private async registerUserCallback(
    request: RegisterUserCall
  ): UserFailableAsync<RegisterUserAnswer> {
    try {
      const response = await this._client
        .getUserService()
        .registerUser(request.username, request.password)
      return Success({
        name: response.getName(),
        id: response.getId(),
      })
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'user',
          code: 1,
          message: e.message,
          name: 'Register user Error',
        },
      }
    }
  }

  private async unregisterUserCallback(): UserFailableAsync<void> {
    try {
      await this._client.getAuthenticationService().refresh()
      await this._client.getUserService().unregisterUser()
      return Success()
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'user',
          code: 2,
          message: e.message,
          name: 'Unregister user Error',
        },
      }
    }
  }

  private async getUserListCallback(): UserFailableAsync<User[]> {
    const userList: User[] = []
    try {
      await this._client.getAuthenticationService().refresh()
      await new Promise((resolve, reject) => {
        try {
          const listStream = this._client.getUserService().getConnectedUsers()
          listStream.on('data', (data: UserInfo) => {
            userList.push({ name: data.getName() })
          })
          listStream.on('error', error => {
            reject(error)
          })
          listStream.on('end', () => {
            listStream.removeAllListeners()
            resolve()
          })
        } catch (e) {
          reject(e)
        }
      })
      return Success(userList)
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'user',
          code: 3,
          message: e.message,
          name: 'Get User List',
        },
      }
    }
  }
}
