import { Failable, FailableAsync } from '../utils/failable'
import {
  ANY_TAGS,
  ChannelsIPC,
  CHANNELS_TO_EVENTS,
  ErrorIPC,
  EventIPCRegister,
  ipcCallMain,
  ipcCallRenderer,
  IPCHandler,
  TaggedCallbacks,
} from './IPC'

export abstract class IPCEventRegisterBase<T extends ChannelsIPC<unknown>>
  implements EventIPCRegister {
  protected abstract taggedCallbacks: TaggedCallbacks<T>
  protected _unregisterers: (() => void)[] = []

  public registerReplies(): void {
    this._unregisterers = []
    for (const key in this.taggedCallbacks) {
      const taggedCallback = this.taggedCallbacks[key]
      this._unregisterers.push(
        IPCHandler.register(taggedCallback.tag, taggedCallback.callback)
      )
    }
  }

  public unregisterReplies(): void {
    for (const unregisterer of this._unregisterers) {
      unregisterer()
    }
  }
}

type whichIPC = 'main' | 'renderer'
type ElectronRendererArgs<T extends whichIPC> = T extends 'renderer'
  ? [Electron.BrowserWindow]
  : []

export class IPCEventsConsumer<
  T extends ChannelsIPC<unknown>,
  I extends whichIPC
> {
  readonly type: I
  protected readonly tags: CHANNELS_TO_EVENTS<T>[0]
  private readonly _events: T
  protected window?: Electron.BrowserWindow
  get events(): T {
    return this._events
  }
  constructor(
    type: I,
    tags: CHANNELS_TO_EVENTS<T>[0],
    ...ipcArgs: ElectronRendererArgs<I>
  ) {
    this.type = type
    this.tags = tags
    if (this.type === 'renderer') {
      this.window = ipcArgs[0] as ElectronRendererArgs<'renderer'>[0]
    }
    this._events = this.initializeEvents()
  }

  private initializeEvents(): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events: Record<string, (data: any) => Promise<any>> = {}
    for (const key in this.tags) {
      events[key] = this.newIPCCall(this.tags[key])
    }
    return events as T
  }

  protected newIPCCall(
    tag: string
  ): (data: unknown) => FailableAsync<unknown, ErrorIPC> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (data: any): FailableAsync<unknown, ErrorIPC> => {
      let res: Failable<unknown, ErrorIPC>
      if (this.type === 'main') {
        res = await ipcCallMain(tag as ANY_TAGS, data)
      } else {
        res = await ipcCallRenderer(
          this.window as Electron.BrowserWindow,
          tag as ANY_TAGS,
          data
        )
      }
      return res
    }
  }
}
