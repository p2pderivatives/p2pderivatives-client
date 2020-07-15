import { UserInfo } from '@internal/gen-grpc/user_pb'
import {
  GET_USERLIST,
  REGISTER_USER,
  UNREGISTER_USER,
} from '../../common/constants/IPC'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { RegisterUserAnswer } from '../../common/models/ipc/RegisterUserAnswer'
import { RegisterUserCall } from '../../common/models/ipc/RegisterUserCall'
import UserListAnswer from '../../common/models/ipc/UserListAnswer'
import { User } from '../../common/models/user/User'
import { GrpcClient } from '../api/grpc/GrpcClient'
import { IPCEventsBase } from './IPCEventsBase'
import { TaggedCallback } from './TaggedCallback'

export class UserEvents extends IPCEventsBase {
  private _client: GrpcClient

  public constructor(client: GrpcClient) {
    super()
    this._client = client
  }

  protected taggedCallbacks(): TaggedCallback[] {
    return [
      {
        tag: REGISTER_USER,
        callback: (data): Promise<RegisterUserAnswer> =>
          this.registerUserCallback(data),
      },
      {
        tag: UNREGISTER_USER,
        callback: (): Promise<GeneralAnswer> => this.unregisterUserCallback(),
      },
      {
        tag: GET_USERLIST,
        callback: (): Promise<UserListAnswer> => this.getUserListCallback(),
      },
    ]
  }

  private async registerUserCallback(
    data: unknown
  ): Promise<RegisterUserAnswer> {
    const request = data as RegisterUserCall
    try {
      const response = await this._client
        .getUserService()
        .registerUser(request.name, request.password)
      const answer = new RegisterUserAnswer(
        true,
        response.getId(),
        response.getName()
      )
      return answer
    } catch (e) {
      return new RegisterUserAnswer(false, '', '', e)
    }
  }

  private async unregisterUserCallback(): Promise<GeneralAnswer> {
    try {
      await this._client.getAuthenticationService().refresh()
      await this._client.getUserService().unregisterUser()
      return new GeneralAnswer(true)
    } catch (e) {
      return new GeneralAnswer(false, e)
    }
  }

  private async getUserListCallback(): Promise<UserListAnswer> {
    const userList: User[] = []
    await this._client.getAuthenticationService().refresh()

    return new Promise<UserListAnswer>((resolve, reject) => {
      try {
        const listStream = this._client.getUserService().getConnectedUsers()
        listStream.on('data', (data: UserInfo) => {
          userList.push(new User(data.getName()))
        })
        listStream.on('error', error => {
          reject(error.message)
        })
        listStream.on('end', () => {
          listStream.removeAllListeners()
          return resolve(new UserListAnswer(true, userList))
        })
      } catch (e) {
        return resolve(new UserListAnswer(false, [], e))
      }
    })
  }
}
