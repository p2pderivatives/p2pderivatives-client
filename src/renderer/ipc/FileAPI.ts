import { OutcomeSimple } from '../../common/models/ipc/ContractSimple'

export interface FileAPI {
  parseOutcomes(path: string): Promise<OutcomeSimple[]>
}
