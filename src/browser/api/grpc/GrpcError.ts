import { ServiceError } from 'grpc'

export class GrpcError {
  private readonly _code: number
  private readonly _name: string
  private readonly _message: string

  public constructor(name: string, message = '', code = -1) {
    this._name = name
    this._message = message
    this._code = code
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
