import electron, { app } from 'electron'
import encoding from 'encoding-down'
import { promises as fs } from 'fs'
import leveldown from 'leveldown'
import levelup, { LevelUp } from 'levelup'
import * as path from 'path'
import winston from 'winston'
import { BitcoinDConfig } from '../common/models/ipc/BitcoinDConfig'
import BitcoinDClient from './api/bitcoind'
import { GrpcAuth } from './api/grpc/GrpcAuth'
import { GrpcClient } from './api/grpc/GrpcClient'
import { GrpcConfig } from './api/grpc/GrpcConfig'
import { OracleClient, OracleConfig } from './api/oracle'
import { AppConfig } from './config/config'
import { LevelConfigRepository } from './config/LevelConfigRepository'
import { ContractUpdater } from './dlc/models/ContractUpdater'
import { DlcEventHandler } from './dlc/models/DlcEventHandler'
import { DlcManager } from './dlc/models/DlcManager'
import { LevelContractRepository } from './dlc/repository/LevelContractRepository'
import { DlcService } from './dlc/service/DlcService'
import { AuthenticationEvents } from './ipc/AuthenticationEvents'
import { BitcoinDEvents } from './ipc/BitcoinDEvents'
import { DlcEvents } from './ipc/DlcEvents'
import { DlcIPCBrowser } from './ipc/DlcIPCBrowser'
import { FileEvents } from './ipc/FileEvents'
import { OracleEvents } from './ipc/OracleEvents'
import { UserEvents } from './ipc/UserEvents'

let db: LevelUp | null = null
let oracleClient: OracleClient | null = null
let client: GrpcClient | null = null
let dlcManager: DlcManager | null = null
let browserWindow: electron.BrowserWindow | null = null

async function initializeDB(userName: string): Promise<void> {
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

async function finalizeDB(): Promise<void> {
  if (db !== null) {
    const tmpDb = db
    db = null
    await tmpDb.close()
  }
}

function bitcoindConfigCallback(
  config: BitcoinDConfig,
  bitcoinDClient: BitcoinDClient
) {
  console.log('CONFIG CALLBACK')
  if (
    oracleClient === null ||
    client === null ||
    db == null ||
    browserWindow == null
  ) {
    throw Error()
  }
  const contractRepository = new LevelContractRepository(db as LevelUp)
  const dlcService = new DlcService(contractRepository)
  const contractUpdater = new ContractUpdater(
    bitcoinDClient,
    config.walletPassphrase ? config.walletPassphrase : ''
  )

  if (dlcManager !== null) {
    dlcManager.finalize()
    dlcManager = null
  }

  const eventHandler = new DlcEventHandler(contractUpdater, dlcService)

  dlcManager = new DlcManager(
    eventHandler,
    dlcService,
    bitcoinDClient,
    new DlcIPCBrowser(browserWindow),
    oracleClient,
    client.getDlcService(),
    winston.createLogger(),
    5
  )

  console.log('CONFIG CALLBACK2')
  const dlcEvents = new DlcEvents(dlcManager, dlcService)
  dlcEvents.registerReplies()
}

async function loginCallBack(userName: string): Promise<void> {
  console.log('LOGIN CALLBACK')
  try {
    await initializeDB(userName)
    const bitcoinEvents = new BitcoinDEvents(
      new LevelConfigRepository(db as LevelUp),
      (config, client) => bitcoindConfigCallback(config, client)
    )
    bitcoinEvents.registerReplies()
    await bitcoinEvents.initialize()
  } catch (error) {
    console.log(error)
    throw error
  }
}

async function logoutCallback(): Promise<void> {
  await finalizeDB()
}

export function initialize(window: electron.BrowserWindow): void {
  browserWindow = window
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
  client = new GrpcClient(grpcConfig, auth)

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
  oracleClient = new OracleClient(oracleConfig)
  const oracleEvents = new OracleEvents(oracleClient)
  oracleEvents.registerReplies()
}

export function finalize(): Promise<void> {
  return finalizeDB()
}
