/* eslint-disable */
import { Contract } from '../../../../common/models/dlc/Contract'
import { AcceptedContract } from './AcceptedContract'
import { BroadcastContract } from './BroadcastContract'
import { ClosedContract } from './ClosedContract'
import { ConfirmedContract } from './ConfirmedContract'
import { FailedContract } from './FailedContract'
import { InitialContract } from './InitialContract'
import { MaturedContract } from './MaturedContract'
import { OfferedContract } from './OfferedContract'
import { RefundedContract } from './RefundedContract'
import { RejectedContract } from './RejectedContract'
import { SignedContract } from './SignedContract'

export { toAcceptMessage } from './AcceptedContract'
export type { AcceptedContract } from './AcceptedContract'
export type { BroadcastContract } from './BroadcastContract'
export type { ClosedContract } from './ClosedContract'
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
  return states.some(x => x == contract.state)
}

export function toSimpleContract(contract: AnyContract): Contract {
  return {
    state: contract.state,
    id: contract.id,
    counterPartyName: contract.counterPartyName,
    localCollateral: contract.localCollateral,
    remoteCollateral: contract.remoteCollateral,
    outcomes: contract.outcomes,
    maturityTime: contract.maturityTime,
    feeRate: contract.feeRate,
    oracleInfo: contract.oracleInfo,
    assetId: contract.assetId,
    premiumAmount: contract.premiumAmount,
    isLocalParty: contract.isLocalParty,
    finalOutcome: contract.finalOutcome,
    outcomeValues: contract.outcomeValues,
  }
}


