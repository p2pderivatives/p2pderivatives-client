import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../../common/models/ipc/GeneralAnswer'
import type { MainProcessIpc, RendererProcessIpc } from 'electron-better-ipc'
type ProcessType = 'renderer' | 'main'
type IPCCallback<T extends ProcessType> = T extends 'main' ? ExtractCallback<MainProcessIpc['answerRenderer']> : ExtractCallback<RendererProcessIpc['answerMain']>
type ExtractCallback<T extends (...args: any) => any> = Parameters<Parameters<T>[1]>
export interface TaggedCallback<T extends ProcessType> {
  tag: string
  callback: (...args: IPCCallback<T>) => Promise<GeneralAnswer | GeneralAnswerProps>
}

