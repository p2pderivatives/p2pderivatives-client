import { app, BrowserWindow } from 'electron'
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
import { BitcoinDEvents, BitcoinDConfigCallback } from './ipc/BitcoinDEvents'
import { FileEvents } from './ipc/FileEvents'
import { OracleEvents } from './ipc/OracleEvents'
import { UserEvents } from './ipc/UserEvents'
import { DlcManager } from './dlc/controller/DlcManager'
import { createLogger, format, transports } from 'winston'
import 'winston-daily-rotate-file'
import { DlcEventHandler } from './dlc/utils/DlcEventHandler'
import { BitcoinDConfig } from '../common/models/ipc/BitcoinDConfig'
import BitcoinDClient from './api/bitcoind'
import { LevelContractRepository } from './dlc/repository/LevelContractRepository'
import { DlcService } from './dlc/service/DlcService'
import { ContractUpdater } from './dlc/utils/ContractUpdater'
import { DlcIPCBrowser } from './ipc/DlcIPCBrowser'
import { DlcEvents } from './ipc/DlcEvents'

let db: LevelUp | null = null
let dlcManager: DlcManager | null = null
const logger = createLogger({
  level: 'info',
  format: format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [new transports.Console()],
})

async function initializeDB(userName: string): Promise<void> {
  await finalizeDB()

  const userPath = app.getPath('userData')
  const userDataPath = path.join(userPath, userName)

  try {
    await fs.access(userDataPath)
  } catch {
    await fs.mkdir(userDataPath)
  }

  const options = {
    keyEncoding: 'hex',
    valueEncoding: 'json',
  }

  const rotateFileTransport = new transports.DailyRotateFile({
    filename: 'p2pd-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    maxFiles: '7d',
    level: 'info',
    dirname: path.join(userDataPath, 'log'),
  })

  logger.transports.push(rotateFileTransport)

  try {
    const levelupAsync: () => Promise<LevelUp> = () =>
      new Promise<LevelUp>((accept, reject) => {
        levelup(
          encoding(leveldown(path.join(userDataPath, 'leveldb')), options),
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

function bitcoindConfigCallback(
  config: BitcoinDConfig,
  bitcoinDClient: BitcoinDClient,
  appConfig: AppConfig,
  dlcIPCBrowser: DlcIPCBrowser,
  grpcClient: GrpcClient
): void {
  const contractRepository = new LevelContractRepository(db as LevelUp)
  const dlcService = new DlcService(contractRepository)
  const contractUpdater = new ContractUpdater(
    bitcoinDClient,
    config.walletPassphrase ? config.walletPassphrase : ''
  )

  const oracleConfig = appConfig.parse<OracleConfig>('oracle')
  const oracleClient = new OracleClient(oracleConfig)
  const oracleEvents = new OracleEvents(oracleClient)
  oracleEvents.registerReplies()

  if (dlcManager !== null) {
    dlcManager.finalize()
    dlcManager = null
  }

  const eventHandler = new DlcEventHandler(contractUpdater, dlcService)

  dlcManager = new DlcManager(
    eventHandler,
    dlcService,
    bitcoinDClient,
    dlcIPCBrowser,
    oracleClient,
    grpcClient.getDlcService(),
    logger,
    5
  )

  dlcManager.initialize()

  console.log('REGISTERED REPLIES')
  const dlcEvents = new DlcEvents(dlcManager, dlcService)
  dlcEvents.registerReplies()
}

async function loginCallBack(
  userName: string,
  configCallback: BitcoinDConfigCallback
): Promise<void> {
  await initializeDB(userName)
  const bitcoinEvents = new BitcoinDEvents(
    new LevelConfigRepository(db as LevelUp),
    configCallback
  )
  bitcoinEvents.registerReplies()
  await bitcoinEvents.initialize()
}

async function logoutCallback(): Promise<void> {
  if (dlcManager) {
    dlcManager.finalize()
  }
  await finalizeDB()
}

export function initialize(browserWindow: BrowserWindow): void {
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
  const grpcClient = new GrpcClient(grpcConfig, auth)
  const dlcIPCBrowser = new DlcIPCBrowser(browserWindow)
  const configCallback: BitcoinDConfigCallback = (
    config: BitcoinDConfig,
    client: BitcoinDClient
  ) => {
    return bitcoindConfigCallback(
      config,
      client,
      appConfig,
      dlcIPCBrowser,
      grpcClient
    )
  }

  const authLoginCallback = (userName: string): Promise<void> => {
    return loginCallBack(userName, configCallback)
  }

  const authEvents = new AuthenticationEvents(
    grpcClient,
    authLoginCallback,
    logoutCallback
  )
  authEvents.registerReplies()

  const userEvents = new UserEvents(grpcClient)
  userEvents.registerReplies()

  const fileEvents = new FileEvents()
  fileEvents.registerReplies()
}

export function finalize(): Promise<void> {
  return finalizeDB()
}
