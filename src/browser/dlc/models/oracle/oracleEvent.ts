import { EventDescriptor } from './descriptor'

export interface OracleEvent {
  nonces: string[]
  eventMaturity: string
  eventDescriptor: EventDescriptor
  eventId: string
}
