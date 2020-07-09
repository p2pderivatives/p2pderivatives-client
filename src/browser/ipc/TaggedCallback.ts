import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../../common/models/ipc/GeneralAnswer'

export type TaggedCallback = {
  tag: string
  callback: (data: unknown) => Promise<GeneralAnswer | GeneralAnswerProps>
}
