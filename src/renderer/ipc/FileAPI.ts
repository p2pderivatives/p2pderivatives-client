import { Outcome } from '../../common/models/dlc/Outcome'

export interface FileAPI {
  getOutcomes(): Promise<Outcome[]>
}
