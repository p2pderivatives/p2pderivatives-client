import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'
import { Contract } from '../dlc/Contract'

export interface DlcAnswerProps extends GeneralAnswerProps {
  _contract: Contract
}

export class DlcAnswer extends GeneralAnswer {
  private readonly _contract: Contract

  public constructor(
    success: boolean,
    contract: Contract,
    error: IPCError | null = null
  ) {
    super(success, error)
    this._contract = contract
  }

  public getContract(): Contract {
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
