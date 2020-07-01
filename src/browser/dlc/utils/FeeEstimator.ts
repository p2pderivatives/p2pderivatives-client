const ApproximateCetVBytes = 190
const ApproximateClosingVBytes = 168

export function getCommonFee(feeRate: number): number {
  return (ApproximateCetVBytes + ApproximateClosingVBytes) * feeRate
}
