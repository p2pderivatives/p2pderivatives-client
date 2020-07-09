import { UserInfo } from '@internal/gen-grpc/user_pb'
import { ClientReadableStream } from 'grpc'
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
  private _listStream: ClientReadableStream<UserInfo> | null = null

  public constructor(client: GrpcClient) {
    super()
    this._client = client
  }

  protected taggedCallbacks(): TaggedCallback[] {
    return [
      {
        tag: REGISTER_USER,
        callback: (data): Promise<RegisterUserAnswer> =>
          this.registerUserCallback(data as RegisterUserCall),
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
    request: RegisterUserCall
  ): Promise<RegisterUserAnswer> {
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
        this._listStream = this._client.getUserService().getConnectedUsers()
        this._listStream.on('data', (data: UserInfo) => {
          userList.push(new User(data.getName()))
        })
        this._listStream.on('error', error => {
          reject(error.message)
        })
        this._listStream.on('end', () => {
          if (this._listStream) {
            this._listStream.removeAllListeners()
            this._listStream = null
          }
          return resolve(new UserListAnswer(true, userList))
        })
      } catch (e) {
        return resolve(new UserListAnswer(false, [], e))
      }
    })
  }
}
