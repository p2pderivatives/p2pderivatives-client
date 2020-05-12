import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'
import { User } from '../user/User'

export interface UserListAnswerProps extends GeneralAnswerProps {
  _userList: User[]
}

export default class UserListAnswer extends GeneralAnswer {
  private readonly _userList: User[]

  public constructor(
    success: boolean,
    userList: User[],
    error: IPCError | null = null
  ) {
    super(success, error)
    this._userList = userList
  }

  public getUserList(): User[] {
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
