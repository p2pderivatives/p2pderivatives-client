/* eslint-disable @typescript-eslint/camelcase */
import { parseFile } from '@fast-csv/parse'
import { Outcome } from '../../../common/models/dlc/Outcome'

type UnparsedRow = {
  price: string
  partyA: string
  partyB: string
}

export default class IOAPI {
  public async readOutcomes(path: string): Promise<Outcome[]> {
    return new Promise((resolve, reject) => {
      const outcomes: Outcome[] = []

      parseFile<UnparsedRow, UnparsedRow>(path, {
        headers: ['price', 'partyA', 'partyB'],
        ignoreEmpty: true,
        strictColumnHandling: true,
      })
        .validate(
          (data: UnparsedRow) =>
            !(isNaN(parseFloat(data.partyA)) || isNaN(parseFloat(data.partyB)))
        )
        .on('error', error => reject(error))
        .on('data', (row: UnparsedRow) => {
          outcomes.push({
            local: parseFloat(row.partyA),
            remote: parseFloat(row.partyB),
            message: row.price,
          })
        })
        .on('end', () => resolve(outcomes))
    })
  }
}
