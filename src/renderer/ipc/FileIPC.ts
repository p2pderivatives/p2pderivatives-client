import { Outcome } from '../../common/models/dlc/Outcome'
import { GET_OUTCOME } from '../../common/constants/IPC'
import OutcomeAnswer, {
  OutcomeAnswerProps,
} from '../../common/models/ipc/OutcomeAnswer'
import { FileAPI } from './FileAPI'

export default class FileIPC implements FileAPI {
  public async getOutcomes(): Promise<Outcome[]> {
    const answerProps = (await window.api.callMain(
      GET_OUTCOME
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
