import { GrpcError } from './GrpcError'
import fs from 'fs'

export class GrpcConfig {
  readonly host: string
  readonly secure: boolean
  readonly certificatePath: string = ''

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
