/* eslint-disable */
import { AcceptedContract } from './AcceptedContract'
import { BroadcastContract } from './BroadcastContract'
import { ConfirmedContract } from './ConfirmedContract'
import { FailedContract } from './FailedContract'
import { InitialContract } from './InitialContract'
import { MaturedContract } from './MaturedContract'
import { OfferedContract } from './OfferedContract'
import { RefundedContract } from './RefundedContract'
import { RejectedContract } from './RejectedContract'
import { SignedContract } from './SignedContract'
import { ClosedContract } from './ClosedContract'
import { StatelessContract } from './StatelessContract'
import { ContractState, Contract } from '../../../../common/models/dlc/Contract'

export { toAcceptMessage } from './AcceptedContract'
export type { AcceptedContract } from './AcceptedContract'
export type { BroadcastContract } from './BroadcastContract'
export type { ConfirmedContract } from './ConfirmedContract'
export type { FailedContract } from './FailedContract'
export { fromOfferMessage } from './InitialContract'
export type { InitialContract } from './InitialContract'
export type { MaturedContract } from './MaturedContract'
export { toOfferMessage } from './OfferedContract'
export type { OfferedContract } from './OfferedContract'
export type { PrivateParams } from './PrivateParams'
export type { RefundedContract } from './RefundedContract'
export type { RejectedContract } from './RejectedContract'
export { toSignMessage } from './SignedContract'
export type { SignedContract } from './SignedContract'
export type { ClosedContract } from './ClosedContract'

export type AnyContract =
  | AcceptedContract
  | BroadcastContract
  | ConfirmedContract
  | FailedContract
  | InitialContract
  | MaturedContract
  | OfferedContract
  | RefundedContract
  | RejectedContract
  | SignedContract
  | ClosedContract

export type ContractToState<C extends AnyContract = AnyContract> = C['state']
export type StateToContract<S extends ContractToState<AnyContract>> = Extract<AnyContract, { state: S }>

export function isContractOfState<S extends ContractToState>(contract: AnyContract, ...states: S[]): contract is StateToContract<S> {
  return contract.state in states
}

