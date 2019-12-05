import { ServiceError } from 'grpc'

export class GrpcError implements ServiceError {
  public code?: import('grpc').status | undefined
  public metadata?: import('grpc').Metadata | undefined
  public details?: string | undefined
  public name: string
  public message: string
  public stack?: string | undefined

  public constructor(name: string, message: string) {
    this.name = name
    this.message = message
  }
}
