import { expect } from 'chai'
import { test, suite } from '@testdeck/mocha'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import { PARSE_OUTCOME } from '../src/common/constants/IPC'
import OutcomeCall from '../src/common/models/ipc/OutcomeCall'
import OutcomeAnswer, {
  OutcomeAnswerProps,
} from '../src/common/models/ipc/OutcomeAnswer'

@suite('IPC-Auth')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Main {
  @test async ipcOutcomeParseShouldSucceed() {
    const outcomeCall: OutcomeCall = {
      outcomesPath: './src/browser/api/io/test.csv',
    }
    const result = (await ipc.callMain(
      PARSE_OUTCOME,
      outcomeCall
    )) as OutcomeAnswerProps
    const answer = OutcomeAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
    expect(answer.getError()).eq(null)
    expect(answer.getOutcomes()[0].fixingPrice).eq(3)
  }
}
