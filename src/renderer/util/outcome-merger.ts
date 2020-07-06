import { Outcome } from '../../common/models/dlc/Outcome'

interface RangeOutcome {
  range: {
    start: number
    end: number
  }
  local: number
  remote: number
}

export const merge = (outcomes: Outcome[]): Outcome[] => {
  const stringOutcomes: Outcome[] = []
  let numericalOutcomes: Outcome[] = []
  outcomes.forEach(o => {
    if (isNaN(parseInt(o.message))) {
      stringOutcomes.push(o)
    } else {
      numericalOutcomes.push(o)
    }
  })
  if (numericalOutcomes.length === 0) return stringOutcomes

  let resultOutcomes: Outcome[] = []

  numericalOutcomes = numericalOutcomes.sort(
    (a, b) => parseInt(a.message) - parseInt(b.message)
  )
  let tempOutcome = outcomeToRangeOutcome(numericalOutcomes[0])

  for (let i = 1; i < numericalOutcomes.length; i++) {
    const o = numericalOutcomes[i]
    const intFixPrice = parseInt(o.message)
    const shouldMerge =
      o.local === tempOutcome.local &&
      o.remote === tempOutcome.remote &&
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
  const message =
    rangeOutcome.range.end === rangeOutcome.range.start
      ? rangeOutcome.range.start.toString()
      : `${rangeOutcome.range.start}-${rangeOutcome.range.end}`
  return {
    local: rangeOutcome.local,
    remote: rangeOutcome.remote,
    message,
  }
}

const outcomeToRangeOutcome: (outcome: Outcome) => RangeOutcome = (
  outcome: Outcome
) => {
  const message = parseInt(outcome.message)
  return {
    local: outcome.local,
    remote: outcome.remote,
    range: {
      start: message,
      end: message,
    },
  }
}
