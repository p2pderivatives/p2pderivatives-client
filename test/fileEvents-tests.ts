import { expect } from 'chai'
import { test, suite } from '@testdeck/mocha'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import { PARSE_OUTCOME } from '../src/common/constants/IPC'
import OutcomeCall from '../src/common/models/ipc/OutcomeCall'
import OutcomeAnswer, {
  OutcomeAnswerProps,
} from '../src/common/models/ipc/OutcomeAnswer'
import { isRangeOutcome } from '../src/common/models/dlc/Outcome'

@suite('IPC-Auth')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Main {
  @test async ipcOutcomeParseShouldSucceed(): Promise<void> {
    const outcomeCall: OutcomeCall = {
      outcomesPath:
        './src/browser/api/io/__tests__/testRangeOutcomesSimple.csv',
    }
    const result = (await ipc.callMain(
      PARSE_OUTCOME,
      outcomeCall
    )) as OutcomeAnswerProps
    const answer = OutcomeAnswer.parse(result)

    expect(answer.isSuccess()).eq(true)
    expect(answer.getError()).eq(null)
    const firstOutcome = answer.getOutcomes()[0]
    if (isRangeOutcome(firstOutcome)) {
      expect(firstOutcome.start).eq(2000)
    } else {
      fail()
    }
  }
}
