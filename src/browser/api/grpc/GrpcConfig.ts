export type GrpcConfig = UnsecureGrpcConfig | SecureGrpcConfig

interface BaseGrpcConfig {
  host: string
  secure: boolean
}

export interface UnsecureGrpcConfig extends BaseGrpcConfig {
  secure: false
}

export interface SecureGrpcConfig extends BaseGrpcConfig {
  secure: true
  certificatePath: string
}

export function isSecureGrpcConfig(
  grpcConfig: GrpcConfig
): grpcConfig is SecureGrpcConfig {
  return grpcConfig.secure
}
