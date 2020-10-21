import { AcceptedContract } from './AcceptedContract'
import { ContractState } from '../../../../common/models/dlc/Contract'
import { StatelessContract } from './StatelessContract'
import { SignMessage, DlcMessageType } from '../messages'
import { AdaptorPair } from '../AdaptorPair'

export interface SignedContract extends StatelessContract<AcceptedContract> {
  readonly state: ContractState.Signed
  readonly fundTxSignatures: ReadonlyArray<string>
  readonly localUtxoPublicKeys: ReadonlyArray<string>
  readonly refundLocalSignature: string
  readonly localCetAdaptorPairs: ReadonlyArray<AdaptorPair>
}

export function toSignMessage(contract: SignedContract): SignMessage {
  return {
    messageType: DlcMessageType.Sign,
    contractId: contract.id,
    fundTxSignatures: contract.fundTxSignatures,
    cetAdaptorPairs: contract.localCetAdaptorPairs,
    refundSignature: contract.refundLocalSignature,
    utxoPublicKeys: contract.localUtxoPublicKeys,
  }
}
