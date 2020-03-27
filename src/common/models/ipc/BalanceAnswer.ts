import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'

export interface BalanceAnswerProps extends GeneralAnswerProps {
  _balance: number
}

export class BalanceAnswer extends GeneralAnswer {
  private readonly _balance: number

  public constructor(
    success: boolean,
    balance: number,
    error: IPCError | null = null
  ) {
    super(success, error)
    this._balance = balance
  }

  public getBalance(): number {
    return this._balance
  }

  public static parse(json: BalanceAnswerProps): BalanceAnswer {
    return new BalanceAnswer(
      json._success,
      json._balance,
      json._error ? IPCError.parse(json._error) : null
    )
  }
}
