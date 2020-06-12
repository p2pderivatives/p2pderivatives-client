import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'

export interface UserAnswerProps extends GeneralAnswerProps {
  _user: string
}

export class UserAnswer extends GeneralAnswer {
  private readonly _user: string

  public constructor(
    success: boolean,
    user: string,
    error: IPCError | null = null
  ) {
    super(success, error)
    this._user = user
  }

  public getUser(): string {
    return this._user
  }

  public static parse(json: UserAnswerProps): UserAnswer {
    return new UserAnswer(
      json._success,
      json._user,
      json._error ? IPCError.parse(json._error) : null
    )
  }
}
