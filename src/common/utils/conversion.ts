const SatoshisInBtc = 100000000

export function btcToSats(amount: number): number {
  return amount * SatoshisInBtc
}

export function satsToBtc(amount: number): number {
  const paddedString = amount.toString().padStart(9, '0')
  const length = paddedString.length
  const withDot =
    paddedString.slice(0, length - 8) + '.' + paddedString.slice(length - 8)
  return parseFloat(withDot)
}
