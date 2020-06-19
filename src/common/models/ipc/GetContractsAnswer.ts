import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'
import { Contract } from '../dlc/Contract'

export interface GetContractsAnswerProps extends GeneralAnswerProps {
  _contractInfos: Contract[]
}

export class GetContractsAnswer extends GeneralAnswer {
  private readonly _contractInfos: Contract[]
  public constructor(
    success: boolean,
    contractInfos: Contract[],
    error?: IPCError | null
  ) {
    super(success, error)
    this._contractInfos = contractInfos
  }

  getContracts(): Contract[] {
    return this._contractInfos
  }

  public static parse(json: GetContractsAnswerProps): GetContractsAnswer {
    return new GetContractsAnswer(
      json._success,
      json._contractInfos,
      json._error ? IPCError.parse(json._error) : null
    )
  }
}
