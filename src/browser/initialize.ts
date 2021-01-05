import { app, BrowserWindow } from 'electron'
import encoding from 'encoding-down'
import { promises as fs } from 'fs'
import leveldown from 'leveldown'
import levelup, { LevelUp } from 'levelup'
import path from 'path'
import { createLogger, format, transports } from 'winston'
import 'winston-daily-rotate-file'
import { IPCEvents } from '../common/models/ipc/IPCEvents'
import { GrpcAuth } from './api/grpc/GrpcAuth'
import { GrpcClient } from './api/grpc/GrpcClient'
import { GrpcConfig, isSecureGrpcConfig } from './api/grpc/GrpcConfig'
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
import { OracleEvents } from './ipc/OracleEvents'
import { UserEvents } from './ipc/UserEvents'

const appLogger = createLogger({
  level: 'info',
  format: format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: 'app-p2pd-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      maxFiles: '7d',
      level: 'info',
      dirname: app.getPath('userData'),
    }),
  ],
})

async function initializeDB(userDataPath: string): Promise<LevelUp> {
  try {
    await fs.access(userDataPath)
  } catch {
    await fs.mkdir(userDataPath)
  }

  const options = {
    keyEncoding: 'hex',
    valueEncoding: 'json',
  }

  try {
    const levelupAsync: () => Promise<LevelUp> = () =>
      new Promise<LevelUp>((accept, reject) => {
        levelup(
          encoding(leveldown(path.join(userDataPath, 'leveldb')), options),
          function(error: Error, db: LevelUp) {
            if (error) {
              appLogger.error('Error opening db', error)
              reject(error)
            } else {
              accept(db)
            }
          }
        )
      })

    return await levelupAsync()
  } catch (error) {
    appLogger.error(
      'Trying to open application with same user already running',
      error
    )
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
  const userPath = app.getPath('userData')
  const userDataPath = path.join(userPath, userName)
  const db = await initializeDB(userDataPath)
  const bitcoinEvents = new BitcoinDEvents(
    new LevelConfigRepository(db as LevelUp)
  )
  bitcoinEvents.registerReplies()
  await bitcoinEvents.initialize()
  const contractRepository = new LevelContractRepository(db as LevelUp)
  const dlcService = new DlcService(contractRepository)
  const contractUpdater = new ContractUpdater(bitcoinEvents.getClient())

  const eventHandler = new DlcEventHandler(contractUpdater, dlcService)

  const rotateFileTransport = new transports.DailyRotateFile({
    filename: 'p2pd-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    maxFiles: '7d',
    level: 'info',
    dirname: path.join(userDataPath, 'log'),
  })

  const userLogger = createLogger({
    level: 'info',
    format: format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [new transports.Console(), rotateFileTransport],
  })

  const dlcManager = new DlcManager(
    eventHandler,
    dlcService,
    bitcoinEvents.getClient(),
    dlcIPCBrowser,
    oracleClient,
    grpcClient.getDlcService(),
    userLogger,
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
  if (isSecureGrpcConfig(grpcConfig)) {
    if (!path.isAbsolute(grpcConfig.certificatePath))
      grpcConfig.certificatePath = path.join(
        resourcesPath,
        grpcConfig.certificatePath
      )
  }
  const grpcClient = new GrpcClient(grpcConfig, auth)
  const dlcIPCBrowser = new DlcIPCBrowser(browserWindow)

  const oracleConfig = appConfig.parse<OracleConfig>('oracle')
  const oracleClient = new OracleClient(oracleConfig.initialOracles[0])

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
    } catch (error) {
      appLogger.error('Error logging out', error)
    }
  }
}
