import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'

export interface RegisterUserProps extends GeneralAnswerProps {
  _id: string
  _account: string
  _name: string
}

export class RegisterUserAnswer extends GeneralAnswer {
  private readonly _id: string
  private readonly _account: string
  private readonly _name: string

  public constructor(
    success: boolean,
    id: string,
    account: string,
    name: string,
    error: IPCError | null = null
  ) {
    super(success, error)
    this._id = id
    this._account = account
    this._name = name
  }

  public getId(): string {
    return this._id
  }

  public getAccount(): string {
    return this._account
  }

  public getName(): string {
    return this._name
  }

  public static parse(json: RegisterUserProps): RegisterUserAnswer {
    return new RegisterUserAnswer(
      json._success,
      json._id,
      json._account,
      json._name,
      json._error ? IPCError.parse(json._error) : null
    )
  }
}
