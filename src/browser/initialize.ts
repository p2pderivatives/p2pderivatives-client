import { app, BrowserWindow } from 'electron'
import encoding from 'encoding-down'
import { promises as fs } from 'fs'
import leveldown from 'leveldown'
import levelup, { LevelUp } from 'levelup'
import path from 'path'
import { createLogger, format, transports } from 'winston'
import 'winston-daily-rotate-file'
import { GrpcAuth } from './api/grpc/GrpcAuth'
import { GrpcClient } from './api/grpc/GrpcClient'
import { GrpcConfig } from './api/grpc/GrpcConfig'
import { OracleClient, OracleConfig } from './api/oracle'
import { AppConfig } from './config/config'
import { LevelConfigRepository } from './config/LevelConfigRepository'
import { DlcManager } from './dlc/controller/DlcManager'
import { LevelContractRepository } from './dlc/repository/LevelContractRepository'
import { DlcService } from './dlc/service/DlcService'
import { ContractUpdater } from './dlc/utils/ContractUpdater'
import { DlcEventHandler } from './dlc/utils/DlcEventHandler'
import { AuthenticationEvents } from './ipc/AuthenticationEvents'
import { BitcoinDEvents } from './ipc/BitcoinDEvents'
import { DlcEvents } from './ipc/DlcEvents'
import { DlcIPCBrowser } from './ipc/DlcIPCBrowser'
import { FileEvents } from './ipc/FileEvents'
import { IPCEvents } from './ipc/IPCEvents'
import { OracleEvents } from './ipc/OracleEvents'
import { UserEvents } from './ipc/UserEvents'

const logger = createLogger({
  level: 'info',
  format: format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [new transports.Console()],
})

async function initializeDB(userName: string): Promise<LevelUp> {
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

    return await levelupAsync()
  } catch (error) {
    throw new Error(
      'An instance of the application with this username is already running'
    )
  }
}

async function finalizeDB(db: LevelUp): Promise<void> {
  await db.close()
}

async function loginCallBack(
  userName: string,
  oracleClient: OracleClient,
  dlcIPCBrowser: DlcIPCBrowser,
  grpcClient: GrpcClient
): Promise<() => Promise<void>> {
  const db = await initializeDB(userName)
  const bitcoinEvents = new BitcoinDEvents(
    new LevelConfigRepository(db as LevelUp)
  )
  bitcoinEvents.registerReplies()
  await bitcoinEvents.initialize()
  const contractRepository = new LevelContractRepository(db as LevelUp)
  const dlcService = new DlcService(contractRepository)
  const contractUpdater = new ContractUpdater(bitcoinEvents.getClient())

  const eventHandler = new DlcEventHandler(contractUpdater, dlcService)

  const dlcManager = new DlcManager(
    eventHandler,
    dlcService,
    bitcoinEvents.getClient(),
    dlcIPCBrowser,
    oracleClient,
    grpcClient.getDlcService(),
    logger,
    5
  )

  const oracleEvents = new OracleEvents(oracleClient)
  oracleEvents.registerReplies()

  const dlcEvents = new DlcEvents(dlcManager, dlcService)
  dlcEvents.registerReplies()
  return (): Promise<void> =>
    logoutCallback(db, dlcManager, [dlcEvents, bitcoinEvents, oracleEvents])
}

async function logoutCallback(
  db: LevelUp,
  dlcManager: DlcManager,
  ipcEvents: IPCEvents[]
): Promise<void> {
  dlcManager.finalize()
  for (const ipcEvent of ipcEvents) {
    ipcEvent.unregisterReplies()
  }
  await finalizeDB(db)
}

export function initialize(browserWindow: BrowserWindow): () => Promise<void> {
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

  const oracleConfig = appConfig.parse<OracleConfig>('oracle')
  const oracleClient = new OracleClient(oracleConfig)

  const authLoginCallback = (
    userName: string
  ): Promise<() => Promise<void>> => {
    return loginCallBack(userName, oracleClient, dlcIPCBrowser, grpcClient)
  }

  const authEvents = new AuthenticationEvents(grpcClient, authLoginCallback)
  authEvents.registerReplies()

  const userEvents = new UserEvents(grpcClient)
  userEvents.registerReplies()

  const fileEvents = new FileEvents()
  fileEvents.registerReplies()

  return async (): Promise<void> => {
    try {
      await authEvents.logout()
    } catch {
      // ignore errors
    }
  }
}
