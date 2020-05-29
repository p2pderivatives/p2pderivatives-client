import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'
import { ContractSimple } from './ContractSimple'

export interface GetContractsAnswerProps extends GeneralAnswerProps {
  _contractInfos: ContractSimple[]
}

export class GetContractsAnswer extends GeneralAnswer {
  private readonly _contractInfos: ContractSimple[]
  public constructor(
    success: boolean,
    contractInfos: ContractSimple[],
    error?: IPCError | null
  ) {
    super(success, error)
    this._contractInfos = contractInfos
  }

  getContracts(): ContractSimple[] {
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
