/* eslint-disable */
import { AcceptedContract } from './AcceptedContract'
import { BroadcastContract } from './BroadcastContract'
import { ConfirmedContract } from './ConfirmedContract'
import { InitialContract } from './InitialContract'
import { MaturedContract } from './MaturedContract'
import { MutualClosedContract } from './MutualClosedContract'
import { MutualCloseProposedContract } from './MutualCloseProposedContract'
import { OfferedContract } from './OfferedContract'
import { RefundedContract } from './RefundedContract'
import { RejectedContract } from './RejectedContract'
import { SignedContract } from './SignedContract'
import { UnilateralClosedByOtherContract } from './UnilateralClosedByOtherContract'
import { UnilateralClosedContract } from './UnilateralClosedContract'

export type { AcceptedContract } from './AcceptedContract'
export type { BroadcastContract } from './BroadcastContract'
export type { ConfirmedContract } from './ConfirmedContract'
export type { InitialContract } from './InitialContract'
export type { MaturedContract } from './MaturedContract'
export type { MutualClosedContract } from './MutualClosedContract'
export type { MutualCloseProposedContract } from './MutualCloseProposedContract'
export type { OfferedContract } from './OfferedContract'
export type { PrivateParams } from './PrivateParams'
export type { RefundedContract } from './RefundedContract'
export type { RejectedContract } from './RejectedContract'
export type { SignedContract } from './SignedContract'
export type { UnilateralClosedByOtherContract } from './UnilateralClosedByOtherContract'
export type { UnilateralClosedContract } from './UnilateralClosedContract'

export type AnyContract =
  | AcceptedContract
  | BroadcastContract
  | ConfirmedContract
  | InitialContract
  | MaturedContract
  | MutualCloseProposedContract
  | MutualClosedContract
  | OfferedContract
  | RefundedContract
  | RejectedContract
  | SignedContract
  | UnilateralClosedContract
  | UnilateralClosedByOtherContract
