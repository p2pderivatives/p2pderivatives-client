/* eslint-disable @typescript-eslint/camelcase */
import { parseFile } from '@fast-csv/parse'
import { Outcome } from '../../../common/models/dlc/Outcome'

type UnparsedRow = {
  message: string
  local: string
  remote: string
}

export default class IOAPI {
  public async readOutcomes(path: string): Promise<Outcome[]> {
    return new Promise((resolve, reject) => {
      const outcomes: Outcome[] = []

      parseFile<UnparsedRow, UnparsedRow>(path, {
        headers: ['message', 'local', 'remote'],
        ignoreEmpty: true,
        strictColumnHandling: true,
      })
        .validate(
          (data: UnparsedRow) =>
            !(
              isNaN(parseFloat(data.local)) ||
              isNaN(parseFloat(data.remote)) ||
              isNaN(parseFloat(data.message))
            )
        )
        .on('error', error => reject(error))
        .on('data', (row: UnparsedRow) => {
          outcomes.push({
            local: parseFloat(row.local),
            remote: parseFloat(row.remote),
            message: row.message,
          })
        })
        .on('end', () => resolve(outcomes))
    })
  }
}
