import { DecompositionDescriptor } from '../../dlc/models/oracle/decompositionDescriptor'
import { EnumerationDescriptor } from '../../dlc/models/oracle/enumerationDescriptor'

// API Response types
export type APIAssets = string[]
export type APIAssetConfig = {
  startDate: string
  frequency: string
  range: string
  base: number
  nbDigits: number
}
export type APIOraclePublicKey = { publicKey: string }
export type APIAnnouncement = {
  announcementSignature: string
  oraclePublicKey: string
  oracleEvent: APIOracleEvent
}
export type APIAttestation = {
  eventId: string
  signatures: string[]
  values: string[]
}
export type APIError = {
  errorCode: number
  message: string
  cause?: string
}
export type APIOracleEvent = {
  nonces: string[]
  eventMaturity: string
  eventDescriptor: DecompositionDescriptor | EnumerationDescriptor
  eventId: string
}
