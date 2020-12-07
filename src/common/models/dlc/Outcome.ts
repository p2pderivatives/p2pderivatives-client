import { EnumerationOutcome } from './EnumerationOutcome'
import { RangeOutcome } from './RangeOutcome'

export type Outcome = EnumerationOutcome | RangeOutcome

export function isEnumerationOutcome(
  outcome: Outcome
): outcome is EnumerationOutcome {
  return 'outcome' in outcome
}

export function isRangeOutcome(outcome: Outcome): outcome is RangeOutcome {
  return 'start' in outcome
}

export function areRangeOutcomes(
  outcomes: Outcome[] | ReadonlyArray<Outcome>
): outcomes is RangeOutcome[] {
  return outcomes.length > 0 && 'start' in outcomes[0]
}
