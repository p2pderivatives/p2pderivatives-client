import * as fs from 'fs'
import yaml from 'js-yaml'
import { GrpcConfig } from '../api/grpc/GrpcConfig'
import { OracleConfig } from '../api/oracle'

type ConfigTypes = GrpcConfig | OracleConfig
type ConfigPath<T extends ConfigTypes> = T extends GrpcConfig
  ? 'grpc'
  : 'oracle'

export class AppConfig {
  private readonly path: string
  private readonly config: Record<string, unknown>

  constructor(path: string) {
    this.path = path
    this.config = yaml.safeLoad(fs.readFileSync(path, 'utf-8'))
  }

  parse<T extends ConfigTypes>(subPath: ConfigPath<T>): T {
    const config = this.config[subPath] as T
    return { ...config }
  }
}
