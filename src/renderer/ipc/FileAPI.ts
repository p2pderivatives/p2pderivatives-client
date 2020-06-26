import { Outcome } from '../../common/models/dlc/Outcome'

export interface FileAPI {
  parseOutcomes(path: string): Promise<Outcome[]>
}
