import { IPCError, IPCErrorProps } from './IPCError'

export interface GeneralAnswerProps {
  _success: boolean
  _error: IPCErrorProps | null
}
export class GeneralAnswer {
  private readonly _success: boolean
  private readonly _error: IPCError | null

  public constructor(success: boolean, error: IPCError | null = null) {
    this._success = success
    this._error = error
  }

  public isSuccess(): boolean {
    return this._success
  }

  public getError(): IPCError | null {
    return this._error
  }

  public static parse(json: GeneralAnswerProps): GeneralAnswer {
    return new GeneralAnswer(
      json._success,
      json._error ? IPCError.parse(json._error) : null
    )
  }
}
