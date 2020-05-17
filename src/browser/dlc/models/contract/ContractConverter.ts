/* eslint-disable @typescript-eslint/no-explicit-any */
import { InitialContractProps, InitialContract } from './InitialContract'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { AcceptedContract, AcceptedContractProps } from './AcceptedContract'
import { Contract } from '../../../../common/models/dlc/Contract'
import { BroadcastContract } from './BroadcastContract'
import { ConfirmedContract } from './ConfirmedContract'
import Amount from '../../../../common/models/dlc/Amount'
import { MaturedContractProps, MaturedContract } from './MaturedContract'
import {
  MutualClosedContract,
  MutualClosedContractProps,
} from './MutualClosedContract'
import {
  MutualCloseProposedContract,
  MutualCloseProposedContractProps,
} from './MutualCloseProposedContract'
import { OfferedContractProps, OfferedContract } from './OfferedContract'
import { RejectedContract } from './RejectedContract'
import { SignedContractProps, SignedContract } from './SignedContract'
import {
  UnilateralClosedContractProps,
  UnilateralClosedContract,
} from './UnilateralClosedContract'

interface Converter {
  state: ContractState
  creator: (contract: Contract) => InitialContract
}

const converters: Converter[] = [
  {
    state: ContractState.Accepted,
    creator: (contract: Contract): InitialContract =>
      createAcceptedContractFromProps(contract as AcceptedContractProps),
  },
  {
    state: ContractState.Broadcast,
    creator: (contract: Contract): InitialContract =>
      createBroadcastContractFromProps(contract as SignedContractProps),
  },
  {
    state: ContractState.Offered,
    creator: (contract: Contract): InitialContract =>
      createOfferedContractFromProps(contract as OfferedContractProps),
  },
  {
    state: ContractState.Confirmed,
    creator: (contract: Contract): InitialContract =>
      createConfirmedContractFromProps(contract as SignedContractProps),
  },
  {
    state: ContractState.Initial,
    creator: (contract: Contract): InitialContract =>
      createInitialContractFromProps(contract as InitialContractProps),
  },
  {
    state: ContractState.Mature,
    creator: (contract: Contract): InitialContract =>
      createMaturedContractFromProps(contract as MaturedContractProps),
  },
  {
    state: ContractState.MutualClosed,
    creator: (contract: Contract): InitialContract =>
      createMutualClosedContractFromProps(
        contract as MutualClosedContractProps
      ),
  },
  {
    state: ContractState.MutualCloseProposed,
    creator: (contract: Contract): InitialContract =>
      createMutualCloseProposedContractFromProps(
        contract as MutualCloseProposedContractProps
      ),
  },
  {
    state: ContractState.Broadcast,
    creator: (contract: Contract): InitialContract =>
      createBroadcastContractFromProps(contract as SignedContractProps),
  },
  {
    state: ContractState.Rejected,
    creator: (contract: Contract): InitialContract =>
      createRejectedContractFromProps(contract as InitialContractProps),
  },
  {
    state: ContractState.Signed,
    creator: (contract: Contract): InitialContract =>
      createSignedContractFromProps(contract as SignedContractProps),
  },
  {
    state: ContractState.UnilateralClosed,
    creator: (contract: Contract): InitialContract =>
      createUnilateralClosedContractFromProps(
        contract as UnilateralClosedContractProps
      ),
  },
]

export default function contractConverter(contract: Contract): InitialContract {
  for (const converter of converters) {
    if (converter.state === contract.state) {
      contract = restoreProperties(contract)
      return converter.creator(contract)
    }
  }

  throw new Error(`No converter found for contract state: ${contract.state}`)
}

function isAmount(obj: any): boolean {
  return obj._satoshis !== undefined
}

function isDateTime(key: string): boolean {
  return key.endsWith('Time')
}

function restoreProperties(obj: any): any {
  if (isAmount(obj)) {
    return Amount.FromSatoshis(obj._satoshis)
  }
  for (const key in obj) {
    const value = obj[key]
    if (Array.isArray(value)) {
      obj[key] = obj[key].map((x: any) => restoreProperties(x))
    }
    if (typeof value !== 'object' || value === null) {
      if (isDateTime(key)) {
        const updated = new Date(value)
        obj[key] = updated
      }
    } else {
      const updated = restoreProperties(value)
      obj[key] = updated
    }
  }

  return obj
}

function createAcceptedContractFromProps(
  props: AcceptedContractProps
): AcceptedContract {
  return AcceptedContract.CreateAcceptedContract(
    props,
    props.remotePartyInputs,
    props.fundTxHex,
    props.fundTxId,
    props.fundTxOutAmount,
    props.refundTxHex,
    props.refundRemoteSignature,
    props.localCetsHex,
    props.remoteCetsHex,
    props.cetSignatures
  )
}

function createBroadcastContractFromProps(
  props: SignedContractProps
): BroadcastContract {
  return BroadcastContract.CreateBroadcastContract(props)
}

function createConfirmedContractFromProps(
  props: SignedContractProps
): ConfirmedContract {
  return ConfirmedContract.CreateConfirmedContract(props)
}

function createInitialContractFromProps(
  props: InitialContractProps
): InitialContract {
  return InitialContract.CreateInitialContract(
    props.id,
    props.counterPartyName,
    props.localCollateral,
    props.remoteCollateral,
    props.outcomes,
    props.maturityTime,
    props.feeRate,
    props.oracleInfo,
    props.isLocalParty,
    props.premiumInfo
  )
}

function createMaturedContractFromProps(
  props: MaturedContractProps
): MaturedContract {
  return MaturedContract.CreateMaturedContract(props, props.finalOutcome)
}

function createMutualClosedContractFromProps(
  props: MutualClosedContractProps
): MaturedContract {
  return MutualClosedContract.CreateMutualClosedContract(
    props,
    props.mutualCloseTx,
    props.mutualCloseTxId,
    props.mutualCloseSignature
  )
}

function createMutualCloseProposedContractFromProps(
  props: MutualCloseProposedContractProps
): MutualCloseProposedContract {
  return MutualCloseProposedContract.CreateMutualCloseProposedContract(
    props,
    props.mutualCloseTx,
    props.mutualCloseTxId,
    props.proposeTimeOut
  )
}

function createOfferedContractFromProps(
  props: OfferedContractProps
): OfferedContract {
  return OfferedContract.CreateOfferedContract(
    props,
    props.localPartyInputs,
    props.privateParams
  )
}

function createRejectedContractFromProps(
  props: InitialContractProps
): RejectedContract {
  return RejectedContract.CreateRejectedContract(props)
}

function createSignedContractFromProps(
  props: SignedContractProps
): SignedContract {
  return SignedContract.CreateSignedContract(
    props,
    props.fundTxSignatures,
    props.localUtxoPublicKeys,
    props.refundLocalSignature,
    props.localCetSignatures
  )
}

function createUnilateralClosedContractFromProps(
  props: UnilateralClosedContractProps
): UnilateralClosedContract {
  return UnilateralClosedContract.CreateUnilateralClosedContract(
    props,
    props.finalCetTxId,
    props.closingTxHex,
    props.closingTxId
  )
}
