import electron from 'electron'
import { AuthenticationEvents } from './ipc/AuthenticationEvents'
import { UserEvents } from './ipc/UserEvents'
import { GrpcClient } from './api/grpc/GrpcClient'
import { GrpcConfig } from './api/grpc/GrpcConfig'
import { GrpcAuth } from './api/grpc/GrpcAuth'
import { BitcoinDEvents } from './ipc/BitcoinDEvents'
import { FileEvents } from './ipc/FileEvents'
import levelup, { LevelUp } from 'levelup'
import encoding from 'encoding-down'
import leveldown from 'leveldown'
import * as path from 'path'
import { promises as fs } from 'fs'
import { LevelConfigRepository } from './config/LevelConfigRepository'
import { DlcEvents } from './ipc/DlcEvents'
import { DlcService } from './dlc/service/DlcService'
import { LevelContractRepository } from './dlc/repository/LevelContractRepository'

let db: LevelUp | null = null

async function InitializeDB(userName: string): Promise<void> {
  const userPath = electron.app.getPath('userData')
  const userDbPath = path.join(userPath, userName)

  try {
    await fs.access(userDbPath)
  } catch {
    await fs.mkdir(userDbPath)
  }

  if (db === null) {
    const options = {
      keyEncoding: 'hex',
      valueEncoding: 'json',
    }

    db = levelup(encoding(leveldown(path.join(userDbPath, 'leveldb')), options))
  }
}

async function FinalizeDB(): Promise<void> {
  if (db !== null) {
    const tmpDb = db
    db = null
    await tmpDb.close()
  }
}

async function LoginCallBack(userName: string): Promise<void> {
  await InitializeDB(userName)
  const bitcoinEvents = new BitcoinDEvents(
    new LevelConfigRepository(db as LevelUp)
  )
  bitcoinEvents.registerReplies()

  const contractRepository = new LevelContractRepository(db as LevelUp)
  const dlcService = new DlcService(contractRepository)
  const dlcEvents = new DlcEvents(dlcService)
  dlcEvents.registerReplies()
}

async function LogoutCallback(): Promise<void> {
  await FinalizeDB()
}

export function Initialize(): void {
  const auth = new GrpcAuth()
  const config = GrpcConfig.fromConfigOrDefault('./settings.yaml')

  const client = new GrpcClient(config, auth)

  const authEvents = new AuthenticationEvents(
    client,
    LoginCallBack,
    LogoutCallback
  )
  authEvents.registerReplies()

  const userEvents = new UserEvents(client)
  userEvents.registerReplies()

  const fileEvents = new FileEvents()
  fileEvents.registerReplies()
}

export function Finalize(): Promise<void> {
  return FinalizeDB()
}
