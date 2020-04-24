import Outcome from '../../common/models/ipc/Outcome'
import OutcomeCall from '../../common/models/ipc/OutcomeCall'
import { PARSE_OUTCOME } from '../../common/constants/IPC'
import OutcomeAnswer, {
  OutcomeAnswerProps,
} from '../../common/models/ipc/OutcomeAnswer'
import { FileAPI } from './FileAPI'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer: ipc } = window.require('electron-better-ipc')

export default class FileIPC implements FileAPI {
  public async parseOutcomes(path: string): Promise<Outcome[]> {
    const call = { outcomesPath: path } as OutcomeCall
    const answerProps = (await ipc.callMain(
      PARSE_OUTCOME,
      call
    )) as OutcomeAnswerProps
    const answer = OutcomeAnswer.parse(answerProps)

    if (answer.isSuccess()) {
      return answer.getOutcomes()
    } else {
      const error = answer.getError()
      throw error
    }
  }
}
