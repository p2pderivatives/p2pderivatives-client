import { InitialContract, InitialContractProps } from './InitialContract'
import { PartyInputs } from '../PartyInputs'
import { PrivateParams } from '../PrivateParams'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { OfferMessage } from '../OfferMessage'

export interface OfferedContractProps extends InitialContractProps {
  readonly localPartyInputs: PartyInputs
  readonly privateParams: PrivateParams
}

export class OfferedContract extends InitialContract
  implements OfferedContractProps {
  protected constructor(
    props: InitialContractProps,
    readonly localPartyInputs: PartyInputs,
    readonly privateParams: PrivateParams
  ) {
    super(
      props.state,
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

  static CreateOfferedContract(
    props: InitialContractProps,
    localPartyInputs: PartyInputs,
    privateParams: PrivateParams
  ): OfferedContract {
    return new OfferedContract(
      { ...props, state: ContractState.Offered },
      localPartyInputs,
      privateParams
    )
  }

  ToOfferMessage(): OfferMessage {
    return new OfferMessage(
      this.id,
      this.localCollateral,
      this.remoteCollateral,
      this.maturityTime,
      this.outcomes,
      this.oracleInfo,
      this.localPartyInputs,
      this.feeRate,
      this.premiumInfo
    )
  }
}
