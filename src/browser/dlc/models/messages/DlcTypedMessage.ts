export enum DlcMessageType {
  Offer = 1,
  Accept = 2,
  Reject = 3,
  Sign = 4,
  MutualCloseOffer = 5,
}

export interface DlcTypedMessage {
  messageType: DlcMessageType
  contractId: string
}
