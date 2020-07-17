import { btcToSats, satsToBtc } from '../conversion'

const testCases: { btc: number; sats: number }[] = [
  { btc: 0.00001, sats: 1000 },
  { btc: 0.00000001, sats: 1 },
  { btc: 1.0, sats: 100000000 },
  { btc: 4567.2340987, sats: 456723409870 },
  { btc: 4567.23409871, sats: 456723409871 },
]

describe('btc conversions tests', () => {
  it('should properly convert from btc to sats', () => {
    for (const test of testCases) {
      expect(btcToSats(test.btc)).toEqual(test.sats)
    }
  })
  it('should properly convert from sats to btc', () => {
    for (const test of testCases) {
      expect(satsToBtc(test.sats)).toEqual(test.btc)
    }
  })
})
