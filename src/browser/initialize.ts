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
import { BitcoinDConfig } from '../common/models/ipc/BitcoinDConfig'
import BitcoinDClient from './api/bitcoind'

let db: LevelUp | null = null
let oracleClient: OracleClient | null = null
let client: GrpcClient | null = null
let dlcManager: DlcManager | null = null

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

function BitcoindConfigCallback(
  config: BitcoinDConfig,
  bitcoinDClient: BitcoinDClient
) {
  console.log('BITCOIND CONFIG CALLBACK!!!!!')
  if (oracleClient === null || client === null || db == null) {
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
    new DlcIPCBrowser(),
    oracleClient,
    client.getDlcService(),
    winston.createLogger(),
    1
  )

  const dlcEvents = new DlcEvents(dlcManager, dlcService)
  dlcEvents.registerReplies()
}

async function LoginCallBack(userName: string): Promise<void> {
  console.log("Hi I'm login callback how are you?")
  try {
    await InitializeDB(userName)
    const bitcoinEvents = new BitcoinDEvents(
      new LevelConfigRepository(db as LevelUp),
      (config, client) => BitcoindConfigCallback(config, client)
    )
    bitcoinEvents.registerReplies()
    await bitcoinEvents.Initialize()
    console.log("I'm all initialized!")
  } catch (error) {
    console.log(error)
    throw error
  }
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
  console.log('ORACLE CONFIG')
  console.log(oracleConfig)
  oracleClient = new OracleClient(oracleConfig)
  const oracleEvents = new OracleEvents(oracleClient)
  oracleEvents.registerReplies()
}

export function Finalize(): Promise<void> {
  return FinalizeDB()
}
