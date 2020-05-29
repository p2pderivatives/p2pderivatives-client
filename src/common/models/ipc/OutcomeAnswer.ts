import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'
import { OutcomeSimple } from './ContractSimple'

export interface OutcomeAnswerProps extends GeneralAnswerProps {
  _outcomes: OutcomeSimple[]
}

export default class OutcomeAnswer extends GeneralAnswer {
  private readonly _outcomes: OutcomeSimple[]

  public constructor(
    success: boolean,
    outcomes: OutcomeSimple[],
    error: IPCError | null = null
  ) {
    super(success, error)
    this._outcomes = outcomes
  }

  public getOutcomes(): OutcomeSimple[] {
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
