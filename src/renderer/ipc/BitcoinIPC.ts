import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'
import {
  CHECK_BITCOIND,
  GET_BALANCE,
  GET_CONFIG,
  GET_UTXO_AMOUNT,
} from '../../common/constants/IPC'
import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../../common/models/ipc/GeneralAnswer'
import {
  BalanceAnswerProps,
  BalanceAnswer,
} from '../../common/models/ipc/BalanceAnswer'
import { BitcoinAPI } from './BitcoinAPI'
import {
  ConfigAnswerProps,
  ConfigAnswer,
} from '../../common/models/ipc/ConfigAnswer'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer: ipc } = window.require('electron-better-ipc')

export class BitcoinIPC implements BitcoinAPI {
  public async checkConfig(config: BitcoinDConfig): Promise<void> {
    const answerProps = (await ipc.callMain(
      CHECK_BITCOIND,
      config
    )) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(answerProps)

    if (!answer.isSuccess()) {
      const error = answer.getError()
      throw error
    }
  }

  public async getBalance(): Promise<number> {
    return BitcoinIPC.getBalanceCommon(GET_BALANCE)
  }

  public async getConfig(): Promise<BitcoinDConfig> {
    const answerProps = (await ipc.callMain(GET_CONFIG)) as ConfigAnswerProps
    const answer = ConfigAnswer.parse(answerProps)

    const config = answer.getConfig()
    if (answer.isSuccess() && config) {
      return config
    } else {
      const error = answer.getError()
      throw error
    }
  }

  public static getUtxoAmount(): Promise<number> {
    return this.getBalanceCommon(GET_UTXO_AMOUNT)
  }

  private static async getBalanceCommon(tag: string): Promise<number> {
    const answerProps = (await ipc.callMain(tag)) as BalanceAnswerProps
    const answer = BalanceAnswer.parse(answerProps)

    if (answer.isSuccess()) {
      return answer.getBalance()
    } else {
      const error = answer.getError()
      throw error
    }
  }
}
