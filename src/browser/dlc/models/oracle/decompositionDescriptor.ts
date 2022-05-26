export interface DecompositionDescriptor {
  digitDecompositionEvent: DecompositionEvent
}

export interface DecompositionEvent {
  base: number
  isSigned: boolean
  unit: string
  precision: number
}
