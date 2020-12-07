import { DecompositionDescriptor } from './decompositionDescriptor'
import { EnumerationDescriptor } from './enumerationDescriptor'

export type EventDescriptor = DecompositionDescriptor | EnumerationDescriptor

export function isDecompositionDescriptor(
  descriptor: EventDescriptor
): descriptor is DecompositionDescriptor {
  return 'base' in descriptor
}

export function isEnumerationDescriptor(
  descriptor: EventDescriptor
): descriptor is EnumerationDescriptor {
  return 'outcomes' in descriptor
}
