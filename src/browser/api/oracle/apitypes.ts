// API Response types
export type APIAssets = string[]
export type APIAssetConfig = { frequency: string; range: string }
export type APIOraclePublicKey = { publicKey: string }
export type APIRvalue = {
  publishDate: string
  rvalue: string
  assetID: string
}
export type APISignature = { signature: string; value: string } & APIRvalue
export type APIError = {
  errorCode: number
  message: string
  cause?: string
}
