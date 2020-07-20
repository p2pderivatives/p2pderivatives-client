export function btcToSats(amount: number): number {
  const btcString = amount.toString()
  const parts = btcString.split('.')
  let rightSide = parts.length === 2 ? parts[1] : ''
  rightSide = rightSide.padEnd(8, '0')
  return parseInt(parts[0] + rightSide)
}

export function satsToBtc(amount: number): number {
  const paddedString = amount.toString().padStart(9, '0')
  const length = paddedString.length
  const withDot =
    paddedString.slice(0, length - 8) + '.' + paddedString.slice(length - 8)
  return parseFloat(withDot)
}
