import { TaggedCallback } from './TaggedCallback'
import { IPCEvents } from '../../common/models/ipc/IPCEvents'
import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'
import type { MainProcessIpc, RendererProcessIpc } from 'electron-better-ipc'

type ProcessType = 'renderer' | 'main'
type IPCProcess = MainProcessIpc | RendererProcessIpc
type WhichIPC<T extends ProcessType> = T extends 'main' ? MainProcessIpc : RendererProcessIpc
type IPCProcessDepsType<
T extends ProcessType,
MainDeps extends keyof MainProcessIpc,
RendererDeps extends keyof RendererProcessIpc> = T extends 'main' ? MainProcessIpc[MainDeps] : RendererProcessIpc[RendererDeps]

export abstract class IPCEventsBase<T, PT extends ProcessType> implements IPCEvents {
  protected readonly _ipcProcess: WhichIPC<PT>
  protected readonly abstract _provider: T
  protected abstract taggedCallbacks: TaggedCallback<PT>[]
  protected _unregisterers: (() => void)[] = []

  constructor(process: PT) {
    if (process === 'main') {
      const { ipcMain } = require('electron-better-ipc')
      this._ipcProcess = ipcMain
    } else {
      const { ipcRenderer } = window.require('electron-better-ipc')
      this._ipcProcess = ipcRenderer
    }
  }

  public abstract registerReplies(): void

  public unregisterReplies(): void {
    for (const unregisterer of this._unregisterers) {
      unregisterer()
    }
  }
}

export abstract class IPCRendererBase<T> extends IPCEventsBase<T, 'renderer'> {
  constructor() {
    super('renderer')
    this._ipcProcess
  }

  get provider(): T {
    return this._provider
  }
}

export abstract class IPCMainBase<T> extends IPCEventsBase<T, 'main'> {
  constructor() {
    super('main')
  }

  public registerReplies(): void {
    this._unregisterers = this.taggedCallbacks.map(
      x => this._ipcProcess.answerRenderer(x.tag, x.callback))
  }
}
