import { GrpcError } from './GrpcError'
import * as fs from 'fs'
import yaml from 'js-yaml'

export interface GrpcConfigProps {
  host: string
  secure: boolean
  certificatePath?: string
}

export function isGrpcConfig(object: any): object is GrpcConfigProps {
  return 'host' in object && 'secure' in object
}

export class GrpcConfig implements GrpcConfigProps {
  readonly host: string
  readonly secure: boolean
  readonly certificatePath: string = ''
  private static defaultConfig: GrpcConfigProps = {
    host: '127.0.0.1:8080',
    secure: false,
  }

  public static fromConfigOrDefault(path?: string): GrpcConfig {
    let userConfig = GrpcConfig.defaultConfig
    if (path) {
      try {
        const tempConfig = yaml.safeLoad(fs.readFileSync(path, 'utf-8'))
        if (isGrpcConfig(tempConfig)) {
          userConfig = tempConfig
        }
      } catch (e) {
        // error parsing file => default will be used
      }
    }
    if (userConfig.secure) {
      return new GrpcConfig(userConfig.host, userConfig.secure)
    } else {
      return new GrpcConfig(
        userConfig.host,
        userConfig.secure,
        userConfig.certificatePath
      )
    }
  }

  public constructor(host: string, secure: boolean, certificatePath?: string) {
    this.host = host
    this.secure = secure
    if (secure) {
      if (certificatePath && fs.existsSync(certificatePath)) {
        this.certificatePath = certificatePath
      } else {
        throw new GrpcError(
          'Bad config!',
          'Did not provide valid certificate path for a secure connection!'
        )
      }
    }
  }
}
