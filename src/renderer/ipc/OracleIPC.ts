import { GET_ORACLE_ASSET_CONFIG } from '../../common/constants/IPC'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import OracleConfigAnswer, {
  OracleConfigAnswerProps,
} from '../../common/models/ipc/OracleConfigAnswer'
import { OracleAssetConfiguration } from '../../common/oracle/oracle'

export default class OracleIPC {
  static async getOracleConfig(
    assetID: string
  ): Promise<OracleAssetConfiguration> {
    const answerProps = (await window.api.callMain(
      GET_ORACLE_ASSET_CONFIG,
      assetID
    )) as OracleConfigAnswerProps
    const generalAnswer = GeneralAnswer.parse(answerProps)

    if (generalAnswer.isSuccess()) {
      return OracleConfigAnswer.parse(answerProps).config
    } else {
      throw generalAnswer.getError()
    }
  }
}
