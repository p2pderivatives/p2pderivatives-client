import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'
import { ContractSimple } from './ContractSimple'

export interface DlcAnswerProps extends GeneralAnswerProps {
  _contract: ContractSimple
}

export class DlcAnswer extends GeneralAnswer {
  private readonly _contract: ContractSimple

  public constructor(
    success: boolean,
    contract: ContractSimple,
    error: IPCError | null = null
  ) {
    super(success, error)
    this._contract = contract
  }

  public getContract(): ContractSimple {
    return this._contract
  }

  public static parse(json: DlcAnswerProps): DlcAnswer {
    return new DlcAnswer(
      json._success,
      json._contract,
      json._error ? IPCError.parse(json._error) : null
    )
  }
}
