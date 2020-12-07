import { OracleEvent } from './oracleEvent'

export interface OracleAnnouncement {
  announcementSignature: string
  oraclePublicKey: string
  oracleEvent: OracleEvent
}
