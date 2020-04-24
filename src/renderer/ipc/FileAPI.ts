import Outcome from '../../common/models/ipc/Outcome'

export interface FileAPI {
  parseOutcomes(path: string): Promise<Outcome[]>
}
