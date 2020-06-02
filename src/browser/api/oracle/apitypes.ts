// API Response types
export type APIAssets = string[]
export type APIAssetConfig = {
  startDate: string
  frequency: string
  range: string
}
export type APIOraclePublicKey = { publicKey: string }
export type APIRvalue = {
  oraclePublicKey: string
  publishDate: string
  rvalue: string
  asset: string
}
export type APISignature = { signature: string; value: string } & APIRvalue
export type APIError = {
  errorCode: number
  message: string
  cause?: string
}
