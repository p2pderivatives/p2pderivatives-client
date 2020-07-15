import { AcceptedContract } from './AcceptedContract'
import { ContractState } from '../../../../common/models/dlc/Contract'
import { StatelessContract } from './StatelessContract'
import { SignMessage, DlcMessageType } from '../messages'

export interface SignedContract extends StatelessContract<AcceptedContract> {
  readonly state: ContractState.Signed
  readonly fundTxSignatures: ReadonlyArray<string>
  readonly localUtxoPublicKeys: ReadonlyArray<string>
  readonly refundLocalSignature: string
  readonly localCetSignatures: ReadonlyArray<string>
}

export function toSignMessage(contract: SignedContract): SignMessage {
  return {
    messageType: DlcMessageType.Sign,
    contractId: contract.id,
    fundTxSignatures: contract.fundTxSignatures,
    cetSignatures: contract.localCetSignatures,
    refundSignature: contract.refundLocalSignature,
    utxoPublicKeys: contract.localUtxoPublicKeys,
  }
}
