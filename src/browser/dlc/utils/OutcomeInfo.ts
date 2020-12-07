import { RangeInfo } from '../models/RangeInfo'
import { DigitTrie, trieLookUp } from './DigitTrie'

export type OutcomeInfo = DigitTrie<RangeInfo> | string[]

export function isDigitTrie(
  outcomeInfo: OutcomeInfo
): outcomeInfo is DigitTrie<RangeInfo> {
  return 'root' in outcomeInfo
}

export function getOutcomeIndexes(
  outcomeInfo: OutcomeInfo,
  outcome: string[]
): [number, number, number] {
  if (isDigitTrie(outcomeInfo)) {
    const queryPath = outcome.map(x => {
      const num = parseInt(x)
      if (isNaN(num)) {
        throw Error('Non numerical outcome for decomposition event.')
      }
      return num
    })
    const { value, path } = trieLookUp(outcomeInfo, queryPath)
    return [value.cetIndex, value.adaptorSignatureIndex, path.length]
  } else {
    const index = outcomeInfo.findIndex(x => x === outcome[0])
    return [index, index, 1]
  }
}
