import { GeneralAnswer, GeneralAnswerProps } from './GeneralAnswer'
import { IPCError } from './IPCError'
import { BitcoinDConfig } from './BitcoinDConfig'

export interface ConfigAnswerProps extends GeneralAnswerProps {
  _config: BitcoinDConfig
}

export class ConfigAnswer extends GeneralAnswer {
  private readonly _config: BitcoinDConfig | null

  public constructor(
    success: boolean,
    config: BitcoinDConfig | null,
    error: IPCError | null = null
  ) {
    super(success, error)
    this._config = config
  }

  public getConfig(): BitcoinDConfig | null {
    return this._config
  }

  public static parse(json: ConfigAnswerProps): ConfigAnswer {
    return new ConfigAnswer(
      json._success,
      json._config,
      json._error ? IPCError.parse(json._error) : null
    )
  }
}
