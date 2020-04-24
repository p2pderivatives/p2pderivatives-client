import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'
import { UserInfo } from '@internal/gen-grpc/user_pb'

export interface UserListAnswerProps extends GeneralAnswerProps {
  _userList: UserInfo[]
}

export default class UserListAnswer extends GeneralAnswer {
  private readonly _userList: UserInfo[]

  public constructor(
    success: boolean,
    userList: UserInfo[],
    error: IPCError | null = null
  ) {
    super(success, error)
    this._userList = userList
  }

  public getUserList(): UserInfo[] {
    return this._userList
  }

  public static parse(json: UserListAnswerProps): UserListAnswer {
    return new UserListAnswer(
      json._success,
      json._userList,
      json._error ? IPCError.parse(json._error) : null
    )
  }
}
