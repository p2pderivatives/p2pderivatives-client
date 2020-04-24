import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'
import Outcome from './Outcome'

export interface OutcomeAnswerProps extends GeneralAnswerProps {
  _outcomes: Outcome[]
}

export default class OutcomeAnswer extends GeneralAnswer {
  private readonly _outcomes: Outcome[]

  public constructor(
    success: boolean,
    outcomes: Outcome[],
    error: IPCError | null = null
  ) {
    super(success, error)
    this._outcomes = outcomes
  }

  public getOutcomes(): Outcome[] {
    return this._outcomes
  }

  public static parse(json: OutcomeAnswerProps): OutcomeAnswer {
    return new OutcomeAnswer(
      json._success,
      json._outcomes,
      json._error ? IPCError.parse(json._error) : null
    )
  }
}
