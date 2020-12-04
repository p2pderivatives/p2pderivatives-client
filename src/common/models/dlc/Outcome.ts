import { EnumerationOutcome } from './EnumerationOutcome'
import { RangeOutcome } from './RangeOutcome'

export type Outcome = EnumerationOutcome | RangeOutcome

export function isEnumerationOutcome(
  outcome: Outcome
): outcome is EnumerationOutcome {
  return 'outcome' in outcome
}

export function areEnumerationOutcomes(
  outcomes: Outcome[] | ReadonlyArray<Outcome>
): outcomes is EnumerationOutcome[] {
  return outcomes.length > 0 && 'outcome' in outcomes[0]
}

export function isRangeOutcome(outcome: Outcome): outcome is RangeOutcome {
  return 'start' in outcome
}

export function areRangeOutcomes(
  outcomes: Outcome[] | ReadonlyArray<Outcome>
): outcomes is RangeOutcome[] {
  return outcomes.length > 0 && 'start' in outcomes[0]
}

export function findOutcome(
  outcomes: Outcome[] | ReadonlyArray<Outcome>,
  value: string
): Outcome | undefined {
  return outcomes.find(x => {
    if (isEnumerationOutcome(x)) {
      return x.outcome === value
    }
    const intVal = parseInt(value)
    if (isNaN(intVal)) {
      throw Error('Invalid outcome value')
    }
    return x.start >= intVal && x.start + x.count < intVal
  })
}
