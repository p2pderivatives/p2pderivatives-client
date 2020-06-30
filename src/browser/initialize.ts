import { app } from 'electron'
import encoding from 'encoding-down'
import { promises as fs } from 'fs'
import leveldown from 'leveldown'
import levelup, { LevelUp } from 'levelup'
import path from 'path'
import { GrpcAuth } from './api/grpc/GrpcAuth'
import { GrpcClient } from './api/grpc/GrpcClient'
import { GrpcConfig } from './api/grpc/GrpcConfig'
import { OracleClient, OracleConfig } from './api/oracle'
import { AppConfig } from './config/config'
import { LevelConfigRepository } from './config/LevelConfigRepository'
import { AuthenticationEvents } from './ipc/AuthenticationEvents'
import { BitcoinDEvents } from './ipc/BitcoinDEvents'
import { FileEvents } from './ipc/FileEvents'
import { OracleEvents } from './ipc/OracleEvents'
import { UserEvents } from './ipc/UserEvents'

let db: LevelUp | null = null

async function initializeDB(userName: string): Promise<void> {
  const userPath = app.getPath('userData')
  const userDbPath = path.join(userPath, userName)

  try {
    await fs.access(userDbPath)
  } catch {
    await fs.mkdir(userDbPath)
  }

  const options = {
    keyEncoding: 'hex',
    valueEncoding: 'json',
  }

  try {
    const levelupAsync: () => Promise<LevelUp> = () =>
      new Promise<LevelUp>((accept, reject) => {
        levelup(
          encoding(leveldown(path.join(userDbPath, 'leveldb')), options),
          function(error: Error, db: LevelUp) {
            if (error) {
              reject(error)
            } else {
              accept(db)
            }
          }
        )
      })

    const tmpDb = await levelupAsync()
    db = db !== null ? db : tmpDb
  } catch (error) {
    throw new Error(
      'An instance of the application with this username is already running'
    )
  }
}

async function finalizeDB(): Promise<void> {
  if (db !== null) {
    const tmpDb = db
    db = null
    await tmpDb.close()
  }
}

async function loginCallBack(userName: string): Promise<void> {
  await initializeDB(userName)
  const bitcoinEvents = new BitcoinDEvents(
    new LevelConfigRepository(db as LevelUp)
  )
  bitcoinEvents.registerReplies()
  await bitcoinEvents.Initialize()
}

async function logoutCallback(): Promise<void> {
  await finalizeDB()
}

export function initialize(): void {
  let resourcesPath: string
  if (!app.isPackaged) {
    resourcesPath = app.getAppPath()
  } else {
    resourcesPath = path.join(app.getAppPath(), '..')
  }
  const configPath = path.join(resourcesPath, 'settings.default.yml')
  const appConfig = new AppConfig(configPath)

  const auth = new GrpcAuth()
  const grpcConfig = appConfig.parse<GrpcConfig>('grpc')
  const client = new GrpcClient(grpcConfig, auth)

  const authEvents = new AuthenticationEvents(
    client,
    loginCallBack,
    logoutCallback
  )
  authEvents.registerReplies()

  const userEvents = new UserEvents(client)
  userEvents.registerReplies()

  const fileEvents = new FileEvents()
  fileEvents.registerReplies()

  const oracleConfig = appConfig.parse<OracleConfig>('oracle')
  const oracleClient = new OracleClient(oracleConfig)
  const oracleEvents = new OracleEvents(oracleClient)
  oracleEvents.registerReplies()
}

export function finalize(): Promise<void> {
  return finalizeDB()
}
