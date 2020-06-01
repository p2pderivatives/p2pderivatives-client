import { DateTime, Duration } from 'luxon'
import { ORACLE_ERROR } from '../../constants/Errors'
import { OracleAssetConfiguration } from '../../oracle/oracle'
import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError, IPCErrorProps } from './IPCError'

export interface OracleConfigAnswerProps extends GeneralAnswerProps {
  startDate: string
  frequency: string
  range: string
}

export const OracleIPCError: IPCErrorProps = {
  _type: ORACLE_ERROR,
  _code: -1,
  _name: 'Oracle Config error',
  _message: 'Unexpected error happened',
}

export default class OracleConfigAnswer extends GeneralAnswer {
  readonly config: OracleAssetConfiguration

  public constructor(
    success: boolean,
    error: IPCError | null = null,
    config: OracleAssetConfiguration
  ) {
    super(success, error)
    this.config = { ...config }
  }

  public static parse(json: OracleConfigAnswerProps): OracleConfigAnswer {
    return new OracleConfigAnswer(
      json._success,
      json._error ? IPCError.parse(json._error) : null,
      {
        startDate: DateTime.fromISO(json.startDate),
        frequency: Duration.fromISO(json.frequency),
        range: Duration.fromISO(json.range),
      }
    )
  }
}
