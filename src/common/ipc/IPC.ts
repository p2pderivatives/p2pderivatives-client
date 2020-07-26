import { FailableAsync } from '../utils/failable'
import { AUTH_TAGGED_EVENTS } from './model/authentication'
import { BITCOIND_TAGGED_EVENTS } from './model/bitcoind'
import { DLC_TAGGED_EVENTS } from './model/dlc'
import { FILE_TAGGED_EVENTS } from './model/file'
import { ORACLE_TAGGED_EVENTS } from './model/oracle'
import { UPDATE_TAGGED_EVENTS } from './model/update'
import { USER_TAGGED_EVENTS } from './model/user'

export interface EventIPCHandler {
  register(
    event: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (data: any, ...args: any[]) => unknown
  ): () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call(event: string, data: unknown, ...args: any): Promise<unknown>
}

// The IPCHandler should be set at start up
export let IPCHandler: EventIPCHandler

export function setEventIPCHandler(handler: EventIPCHandler): void {
  IPCHandler = handler
}

export function ipcCallRenderer<T extends ANY_TAGS>(
  window: Electron.BrowserWindow,
  tag: T,
  data: IPCCall<T>
): Promise<IPCReturn<T>> {
  return IPCHandler.call(tag, data, window) as Promise<IPCReturn<T>>
}

export function ipcCallMain<T extends ANY_TAGS>(
  tag: T,
  data: IPCCall<T>
): Promise<IPCReturn<T>> {
  return IPCHandler.call(tag, data) as Promise<IPCReturn<T>>
}

export interface ErrorIPC {
  type: string
  code: number
  message: string
  name: string
}

type IPCCall<T extends ANY_TAGS> = Parameters<ExtractCallBack<T>>
export type IPCReturn<T extends ANY_TAGS> = ReturnType<ExtractCallBack<T>>
type ExtractCallBack<T extends ANY_TAGS> = ANY_TAGGED_CALLBACK extends Record<
  string,
  infer TC
>
  ? TC extends { tag: T; callback: infer C }
    ? C
    : never
  : never

export type ANY_TAGS = ANY_TAGGED_CALLBACK extends Record<
  string,
  { tag: infer T }
>
  ? T
  : never

export type ANY_TAGGED_CALLBACK = TaggedCallbacks<ANY_EVENTS[1]>
type ANY_EVENTS =
  | ORACLE_TAGGED_EVENTS
  | DLC_TAGGED_EVENTS
  | USER_TAGGED_EVENTS
  | FILE_TAGGED_EVENTS
  | BITCOIND_TAGGED_EVENTS
  | AUTH_TAGGED_EVENTS
  | UPDATE_TAGGED_EVENTS

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CHANNELS_TO_EVENTS<T> = Extract<ANY_EVENTS, [any, T, any]>
export interface EventIPCRegister {
  registerReplies(): void
  unregisterReplies(): void
}

export type Implements<T, U extends T> = {}
export type ChannelsIPC<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [E in keyof T]: (data: any) => FailableAsync<any, ErrorIPC>
}

export type ConstrainEvents<
  EVENTS extends Record<string, string>,
  THIS extends ChannelsIPC<EVENTS>
> = Implements<ChannelsIPC<EVENTS>, THIS>

type TaggedCallback<
  T extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C extends (...data: any) => any
> = C extends (...data: infer P) => infer R
  ? Readonly<{
      tag: T
      callback: (...data: P) => R
    }>
  : never

export type TaggedCallbacks<
  CHA extends ChannelsIPC<unknown>,
  TUP extends CHANNELS_TO_EVENTS<CHA> = CHANNELS_TO_EVENTS<CHA>
> = TUP extends [Record<string, string>, ChannelsIPC<TUP[0]>, ErrorIPC]
  ? {
      [key in keyof TUP[0]]: TaggedCallback<TUP[0][key], TUP[1][key]>
    }
  : never
