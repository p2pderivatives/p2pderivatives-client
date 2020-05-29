import electron from 'electron'
import encoding from 'encoding-down'
import { promises as fs } from 'fs'
import leveldown from 'leveldown'
import levelup, { LevelUp } from 'levelup'
import * as path from 'path'
import { GrpcAuth } from './api/grpc/GrpcAuth'
import { GrpcClient } from './api/grpc/GrpcClient'
import { GrpcConfig } from './api/grpc/GrpcConfig'
import { OracleClient, OracleConfig } from './api/oracle'
import { AppConfig } from './config/config'
import { LevelConfigRepository } from './config/LevelConfigRepository'
import { LevelContractRepository } from './dlc/repository/LevelContractRepository'
import { DlcService } from './dlc/service/DlcService'
import { AuthenticationEvents } from './ipc/AuthenticationEvents'
import { BitcoinDEvents } from './ipc/BitcoinDEvents'
import { DlcEvents } from './ipc/DlcEvents'
import { FileEvents } from './ipc/FileEvents'
import { OracleEvents } from './ipc/OracleEvents'
import { UserEvents } from './ipc/UserEvents'
import { DlcManager } from './dlc/models/DlcManager'
import { DlcEventHandler } from './dlc/models/DlcEventHandler'
import { ContractUpdater } from './dlc/models/ContractUpdater'
import { DlcIPCBrowser } from './ipc/DlcIPCBrowser'
import { DlcMessageService } from './api/grpc/DlcMessageService'
import winston from 'winston'

let db: LevelUp | null = null
let oracleClient: OracleClient | null = null
let client: GrpcClient | null = null

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
  // TODO(tibo): would make more sense to do outside of event object
  await bitcoinEvents.Initialize()
  const bitcoindConfig = bitcoinEvents.getConfig()
  if (bitcoindConfig == null) {
    throw Error()
  }
  const contractUpdater = new ContractUpdater(
    bitcoinEvents.getClient(),
    bitcoindConfig.walletPassphrase ? bitcoindConfig.walletPassphrase : ''
  )
  if (oracleClient == null || client == null) {
    throw Error()
  }
  const eventHandler = new DlcEventHandler(contractUpdater, dlcService)

  const dlcManager = new DlcManager(
    eventHandler,
    dlcService,
    bitcoinEvents.getClient(),
    new DlcIPCBrowser(),
    oracleClient,
    client.getDlcService(),
    winston.createLogger(),
    1
  )

  const dlcEvents = new DlcEvents(dlcManager, dlcService)
  dlcEvents.registerReplies()
}

async function LogoutCallback(): Promise<void> {
  await FinalizeDB()
}

export function Initialize(): void {
  const appConfig = new AppConfig('./settings.default.yaml')
  const auth = new GrpcAuth()
  const grpcConfig = appConfig.parse<GrpcConfig>('grpc')
  client = new GrpcClient(grpcConfig, auth)

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

  const oracleConfig = appConfig.parse<OracleConfig>('oracle')
  oracleClient = new OracleClient(oracleConfig)
  const oracleEvents = new OracleEvents(oracleClient)
  oracleEvents.registerReplies()
}

export function Finalize(): Promise<void> {
  return FinalizeDB()
}
