import { merge } from '../outcome-merger'
import Outcome from '../../../common/models/ipc/Outcome'

describe('outcome merge tests', () => {
  it('should merge numerical ranges with same outcomes', () => {
    const outcomes: Outcome[] = [
      { fixingPrice: '1', aReward: 1, bReward: 0 },
      { fixingPrice: '2', aReward: 1, bReward: 0 },
      { fixingPrice: '3', aReward: 1, bReward: 0 },
      { fixingPrice: '4', aReward: 1, bReward: 0 },
      { fixingPrice: '5', aReward: 0, bReward: 1 },
      { fixingPrice: '6', aReward: 0, bReward: 1 },
      { fixingPrice: '7', aReward: 0, bReward: 1 },
      { fixingPrice: '8', aReward: 0, bReward: 1 },
      { fixingPrice: '9', aReward: 1, bReward: 0 },
      { fixingPrice: '10', aReward: 1, bReward: 0 },
      { fixingPrice: '11', aReward: 1, bReward: 0 },
      { fixingPrice: '12', aReward: 1, bReward: 0 },
    ]

    const result = merge(outcomes)
    expect(result.length).toBe(3)
    expect(result[0].fixingPrice).toBe('1-4')
    expect(result[0].aReward).toBe(1)
    expect(result[1].fixingPrice).toBe('5-8')
    expect(result[1].aReward).toBe(0)
    expect(result[2].fixingPrice).toBe('9-12')
    expect(result[2].aReward).toBe(1)
  })

  it('should merge numerical, but leave other values', () => {
    const outcomes: Outcome[] = [
      { fixingPrice: '1', aReward: 1, bReward: 0 },
      { fixingPrice: '2', aReward: 1, bReward: 0 },
      { fixingPrice: '3', aReward: 1, bReward: 0 },
      { fixingPrice: '4', aReward: 1, bReward: 0 },
      { fixingPrice: 'fail', aReward: 0.5, bReward: 0.5 },
      { fixingPrice: 'success', aReward: 0, bReward: 1 },
    ]

    const result = merge(outcomes)
    expect(result.length).toBe(3)
    expect(result[0].fixingPrice).toBe('1-4')
    expect(result[0].aReward).toBe(1)
    expect(result[1].fixingPrice).toBe('fail')
    expect(result[1].aReward).toBe(0.5)
    expect(result[2].fixingPrice).toBe('success')
    expect(result[2].aReward).toBe(0)
  })

  it('should not merge other values with same reward', () => {
    const outcomes: Outcome[] = [
      { fixingPrice: 'success', aReward: 1, bReward: 0 },
      { fixingPrice: 'maybe', aReward: 1, bReward: 0 },
      { fixingPrice: 'fail', aReward: 0.5, bReward: 0.5 },
    ]

    const result = merge(outcomes)
    expect(result.length).toBe(3)
    expect(result[0].fixingPrice).toBe('success')
    expect(result[0].aReward).toBe(1)
    expect(result[1].fixingPrice).toBe('maybe')
    expect(result[1].aReward).toBe(1)
    expect(result[2].fixingPrice).toBe('fail')
    expect(result[2].aReward).toBe(0.5)
  })

  it('should only merge sequential fixing prices with same reward', () => {
    const outcomes: Outcome[] = [
      { fixingPrice: '1', aReward: 1, bReward: 0 },
      { fixingPrice: '3', aReward: 1, bReward: 0 },
      { fixingPrice: '4', aReward: 1, bReward: 0 },
      { fixingPrice: '5', aReward: 0, bReward: 1 },
      { fixingPrice: '6', aReward: 0, bReward: 1 },
      { fixingPrice: '7', aReward: 0, bReward: 1 },
      { fixingPrice: '8', aReward: 0, bReward: 1 },
    ]

    const result = merge(outcomes)
    expect(result.length).toBe(3)
    expect(result[0].fixingPrice).toBe('1')
    expect(result[0].aReward).toBe(1)
    expect(result[1].fixingPrice).toBe('3-4')
    expect(result[1].aReward).toBe(1)
    expect(result[2].fixingPrice).toBe('5-8')
    expect(result[2].aReward).toBe(0)
  })
})
