import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../../common/models/ipc/GeneralAnswer'

export interface TaggedCallback {
  tag: string
  callback: (data: unknown) => Promise<GeneralAnswer | GeneralAnswerProps>
}
