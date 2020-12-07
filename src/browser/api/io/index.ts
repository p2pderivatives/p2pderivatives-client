/* eslint-disable @typescript-eslint/camelcase */
import { parseFile } from '@fast-csv/parse'
import { EnumerationOutcome } from '../../../common/models/dlc/EnumerationOutcome'
import { Outcome } from '../../../common/models/dlc/Outcome'
import { RangeOutcome } from '../../../common/models/dlc/RangeOutcome'

type UnparsedRow = {
  message: string
  local: string
  remote: string
}

type PayoutRow = {
  message: string
  local: number
  remote: number
}

export default class IOAPI {
  private parseRowsToEnumerationOutcomes(
    outcomes: PayoutRow[]
  ): EnumerationOutcome[] {
    return outcomes.map(x => {
      return {
        outcome: x.message,
        payout: {
          local: x.local,
          remote: x.remote,
        },
      }
    })
  }

  private parseRowsToRangeOutcomes(outcomes: PayoutRow[]): RangeOutcome[] {
    if (outcomes.length === 0) return []
    const resultOutcomes: RangeOutcome[] = []
    outcomes = outcomes.sort((a, b) => {
      const aVal = parseInt(a.message.split('-')[0])
      const bVal = parseInt(b.message.split('-')[0])
      if (isNaN(aVal) || isNaN(bVal)) {
        throw Error('Invalid outcome value')
      }

      return aVal - bVal
    })
    let tempOutcome = this.parseRowToRangeOutcome(outcomes[0])

    for (let i = 1; i < outcomes.length; i++) {
      const o = this.parseRowToRangeOutcome(outcomes[i])
      if (o.start < tempOutcome.start + tempOutcome.count) {
        throw Error('Overlapping outcome values')
      }
      const shouldMerge =
        o.payout.local === tempOutcome.payout.local &&
        o.payout.remote === tempOutcome.payout.remote &&
        tempOutcome.start + tempOutcome.count === o.start
      if (shouldMerge) {
        tempOutcome = {
          ...tempOutcome,
          count: tempOutcome.count + o.count,
        }
      } else {
        resultOutcomes.push(tempOutcome)
        tempOutcome = o
      }
    }

    resultOutcomes.push(tempOutcome)

    return resultOutcomes
  }

  parseRowToRangeOutcome(unparsed: PayoutRow): RangeOutcome {
    const parts = unparsed.message.split('-')

    const start = parseInt(parts[0])
    const end = parts.length > 1 ? parseInt(parts[1]) : start
    const local = unparsed.local
    const remote = unparsed.remote

    if (isNaN(start) || isNaN(end)) {
      throw Error('Invalid outcome')
    }

    const count = end - start + 1

    return {
      start,
      count,
      payout: {
        local,
        remote,
      },
    }
  }

  public async readRangeOutcomes(path: string): Promise<RangeOutcome[]> {
    return this.readOutcomes(path, this.parseRowsToRangeOutcomes.bind(this))
  }

  public async readEnumerationOutcomes(
    path: string
  ): Promise<EnumerationOutcome[]> {
    return this.readOutcomes(
      path,
      this.parseRowsToEnumerationOutcomes.bind(this)
    )
  }

  private async readOutcomes<T extends Outcome>(
    path: string,
    parseFunc: (raw: PayoutRow[]) => T[]
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const payoutRows: PayoutRow[] = []

      parseFile<UnparsedRow, UnparsedRow>(path, {
        headers: ['message', 'local', 'remote'],
        ignoreEmpty: true,
        strictColumnHandling: true,
      })
        .validate(
          (data: UnparsedRow) =>
            !isNaN(parseInt(data.local)) && !isNaN(parseInt(data.remote))
        )
        .transform(
          (x: UnparsedRow): PayoutRow => {
            return {
              message: x.message,
              local: parseInt(x.local),
              remote: parseInt(x.remote),
            }
          }
        )
        .on('data-invalid', () => {
          throw Error('Invalid data encountered')
        })
        .on('error', error => reject(error))
        .on('data', (row: PayoutRow) => {
          payoutRows.push(row)
        })
        .on('end', () => {
          try {
            const parsed = parseFunc(payoutRows)
            resolve(parsed)
          } catch (error) {
            reject(error)
          }
        })
    })
  }
}
