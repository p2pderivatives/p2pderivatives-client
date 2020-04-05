import { RegisterUserCall } from '../../common/models/ipc/RegisterUserCall'
import { RegisterUserAnswer } from '../../common/models/ipc/RegisterUserAnswer'
import { GrpcClient } from '../api/grpc/GrpcClient'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { ipcMain as ipc } from 'electron-better-ipc'
import { ClientReadableStream } from 'grpc'
import { UserInfo } from '@internal/gen-grpc/user_pb'
import { IPCEvents } from './IPCEvents'
import {
  REGISTER_USER,
  UNREGISTER_USER,
  GET_USERLIST,
  SEND_USER,
  SEND_USER_END,
} from '../../common/constants/IPC'
import { User } from '../../common/models/user/User'

export class UserEvents implements IPCEvents {
  private _client: GrpcClient
  private _listStream: ClientReadableStream<UserInfo> | null = null

  public constructor(client: GrpcClient) {
    this._client = client
  }

  public registerReplies(): void {
    ipc.answerRenderer(REGISTER_USER, async data => {
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
    })

    ipc.answerRenderer(UNREGISTER_USER, async data => {
      try {
        await this._client.getAuthenticationService().refresh()
        await this._client.getUserService().unregisterUser()
        return new GeneralAnswer(true)
      } catch (e) {
        return new GeneralAnswer(false, e)
      }
    })

    ipc.answerRenderer(GET_USERLIST, async data => {
      try {
        await this._client.getAuthenticationService().refresh()
        this._listStream = this._client.getUserService().getUserListStream()
        this._listStream.on('data', (data: UserInfo) => {
          ipc.callFocusedRenderer(SEND_USER, new User(data.getName()))
        })
        this._listStream.on('close', () => {
          if (this._listStream) {
            this._listStream.removeAllListeners()
            this._listStream = null
            ipc.callFocusedRenderer(SEND_USER_END)
          }
        })
        return new GeneralAnswer(true)
      } catch (e) {
        return new GeneralAnswer(false, e)
      }
    })
  }
}
