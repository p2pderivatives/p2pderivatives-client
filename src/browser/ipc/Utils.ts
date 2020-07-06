import { ipcMain as ipc } from 'electron-better-ipc'
import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../../common/models/ipc/GeneralAnswer'

export type TaggedCallback = {
  tag: string
  callback: (data: unknown) => Promise<GeneralAnswer | GeneralAnswerProps>
}

export function registerTaggedCallbacks(
  taggedCallbacks: TaggedCallback[]
): (() => void)[] {
  return taggedCallbacks.map(x => ipc.answerRenderer(x.tag, x.callback))
}
