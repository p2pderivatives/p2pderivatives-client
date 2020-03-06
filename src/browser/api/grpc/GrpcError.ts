import { ServiceError } from 'grpc'
import { GENERAL_ERROR } from '../../../common/constants/Errors'

export class GrpcError {
  protected _type = GENERAL_ERROR
  protected readonly _code: number
  protected readonly _name: string
  protected readonly _message: string

  public constructor(name: string, message = '', code = -1) {
    this._name = name
    this._message = message
    this._code = code
  }

  public getType(): string {
    return this._type
  }

  public getCode(): number {
    return this._code
  }

  public getName(): string {
    return this._name
  }

  public getMessage(): string {
    return this._message
  }

  public static fromServiceError(error: ServiceError): GrpcError {
    return new GrpcError(error.name, error.details, error.code)
  }
}
