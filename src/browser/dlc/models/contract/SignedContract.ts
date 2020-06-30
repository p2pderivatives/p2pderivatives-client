import { AcceptedContract } from './AcceptedContract'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { StatelessContract } from './StatelessContract'
import { SignMessage, DlcMessageType } from '../messages'

export interface SignedContract extends StatelessContract<AcceptedContract> {
  readonly state: ContractState.Signed
  readonly fundTxSignatures: string[]
  readonly localUtxoPublicKeys: string[]
  readonly refundLocalSignature: string
  readonly localCetSignatures: string[]
}

export function toSignMessage(
  contract: SignedContract,
  cetSignatures: string[]
): SignMessage {
  return {
    messageType: DlcMessageType.Sign,
    contractId: contract.id,
    fundTxSignatures: contract.fundTxSignatures,
    cetSignatures,
    refundSignature: contract.refundLocalSignature,
    utxoPublicKeys: contract.localUtxoPublicKeys,
  }
}
