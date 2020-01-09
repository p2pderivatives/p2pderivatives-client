import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'

export interface RegisterUserProps extends GeneralAnswerProps {
  _id: string
  _name: string
}

export class RegisterUserAnswer extends GeneralAnswer {
  private readonly _id: string
  private readonly _name: string

  public constructor(
    success: boolean,
    id: string,
    name: string,
    error: IPCError | null = null
  ) {
    super(success, error)
    this._id = id
    this._name = name
  }

  public getId(): string {
    return this._id
  }

  public getName(): string {
    return this._name
  }

  public static parse(json: RegisterUserProps): RegisterUserAnswer {
    return new RegisterUserAnswer(
      json._success,
      json._id,
      json._name,
      json._error ? IPCError.parse(json._error) : null
    )
  }
}
