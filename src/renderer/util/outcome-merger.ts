import Outcome from '../../common/models/ipc/Outcome'

interface RangeOutcome {
  range: {
    start: number
    end: number
  }
  outcomeA: number
  outcomeB: number
}

export const merge = (outcomes: Outcome[]): Outcome[] => {
  const stringOutcomes: Outcome[] = []
  const numericalOutcomes: Outcome[] = []
  outcomes.forEach(o => {
    if (isNaN(parseInt(o.fixingPrice))) {
      stringOutcomes.push(o)
    } else {
      numericalOutcomes.push(o)
    }
  })
  if (numericalOutcomes.length === 0) return outcomes

  let resultOutcomes: Outcome[] = []

  numericalOutcomes.sort(o => parseInt(o.fixingPrice))
  let tempOutcome = outcomeToRangeOutcome(numericalOutcomes[0])

  for (let i = 1; i < numericalOutcomes.length; i++) {
    const o = numericalOutcomes[i]
    const intFixPrice = parseInt(o.fixingPrice)
    const shouldMerge =
      o.aReward === tempOutcome.outcomeA &&
      o.bReward === tempOutcome.outcomeB &&
      tempOutcome.range.end + 1 === intFixPrice
    if (shouldMerge) {
      tempOutcome.range.end = intFixPrice
    } else {
      resultOutcomes.push(rangeOutcomeToOutcome(tempOutcome))
      tempOutcome = outcomeToRangeOutcome(o)
    }
  }

  resultOutcomes.push(rangeOutcomeToOutcome(tempOutcome))

  resultOutcomes = resultOutcomes.concat(stringOutcomes)
  return resultOutcomes
}

const rangeOutcomeToOutcome: (rangeOutcome: RangeOutcome) => Outcome = (
  rangeOutcome: RangeOutcome
) => {
  const fixingPrice =
    rangeOutcome.range.end == rangeOutcome.range.start
      ? rangeOutcome.range.start.toString()
      : `${rangeOutcome.range.start}-${rangeOutcome.range.end}`
  return {
    aReward: rangeOutcome.outcomeA,
    bReward: rangeOutcome.outcomeB,
    fixingPrice,
  }
}

const outcomeToRangeOutcome: (outcome: Outcome) => RangeOutcome = (
  outcome: Outcome
) => {
  const fixPrice = parseInt(outcome.fixingPrice)
  return {
    outcomeA: outcome.aReward,
    outcomeB: outcome.bReward,
    range: {
      start: fixPrice,
      end: fixPrice,
    },
  }
}
