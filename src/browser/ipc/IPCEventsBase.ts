import { ipcMain as ipc } from 'electron-better-ipc'
import { TaggedCallback } from './TaggedCallback'
import { IPCEvents } from './IPCEvents'

export abstract class IPCEventsBase implements IPCEvents {
  private _unregisterers: (() => void)[] = []

  protected abstract taggedCallbacks(): TaggedCallback[]

  public registerReplies(): void {
    this._unregisterers = this.registerTaggedCallbacks(this.taggedCallbacks())
  }

  public unregisterReplies(): void {
    for (const unregisterer of this._unregisterers) {
      unregisterer()
    }
  }

  private registerTaggedCallbacks(
    taggedCallbacks: TaggedCallback[]
  ): (() => void)[] {
    return taggedCallbacks.map(x => ipc.answerRenderer(x.tag, x.callback))
  }
}
