import { merge } from '../outcome-merger'
import { Outcome } from '../../../common/models/dlc/Outcome'

describe('outcome merge tests', () => {
  it('should merge numerical ranges with same outcomes', () => {
    const outcomes: Outcome[] = [
      { message: '1', local: 1, remote: 0 },
      { message: '2', local: 1, remote: 0 },
      { message: '3', local: 1, remote: 0 },
      { message: '4', local: 1, remote: 0 },
      { message: '5', local: 0, remote: 1 },
      { message: '6', local: 0, remote: 1 },
      { message: '7', local: 0, remote: 1 },
      { message: '8', local: 0, remote: 1 },
      { message: '9', local: 1, remote: 0 },
      { message: '10', local: 1, remote: 0 },
      { message: '11', local: 1, remote: 0 },
      { message: '12', local: 1, remote: 0 },
    ]

    const result = merge(outcomes)
    expect(result.length).toBe(3)
    expect(result[0].message).toBe('1-4')
    expect(result[0].local).toBe(1)
    expect(result[1].message).toBe('5-8')
    expect(result[1].local).toBe(0)
    expect(result[2].message).toBe('9-12')
    expect(result[2].local).toBe(1)
  })

  it('should merge numerical ranges with same outcomes if not ordered', () => {
    const outcomes: Outcome[] = [
      { message: '1', local: 1, remote: 0 },
      { message: '3', local: 1, remote: 0 },
      { message: '2', local: 1, remote: 0 },
      { message: '4', local: 1, remote: 0 },
      { message: '5', local: 0, remote: 1 },
      { message: '6', local: 0, remote: 1 },
      { message: '8', local: 0, remote: 1 },
      { message: '7', local: 0, remote: 1 },
      { message: '9', local: 1, remote: 0 },
      { message: '10', local: 1, remote: 0 },
      { message: '11', local: 1, remote: 0 },
      { message: '12', local: 1, remote: 0 },
    ]

    const result = merge(outcomes)
    expect(result.length).toBe(3)
    expect(result[0].message).toBe('1-4')
    expect(result[0].local).toBe(1)
    expect(result[1].message).toBe('5-8')
    expect(result[1].local).toBe(0)
    expect(result[2].message).toBe('9-12')
    expect(result[2].local).toBe(1)
  })

  it('should merge numerical, but leave other values', () => {
    const outcomes: Outcome[] = [
      { message: '1', local: 1, remote: 0 },
      { message: '2', local: 1, remote: 0 },
      { message: '3', local: 1, remote: 0 },
      { message: '4', local: 1, remote: 0 },
      { message: 'fail', local: 0.5, remote: 0.5 },
      { message: 'success', local: 0, remote: 1 },
    ]

    const result = merge(outcomes)
    expect(result.length).toBe(3)
    expect(result[0].message).toBe('1-4')
    expect(result[0].local).toBe(1)
    expect(result[1].message).toBe('fail')
    expect(result[1].local).toBe(0.5)
    expect(result[2].message).toBe('success')
    expect(result[2].local).toBe(0)
  })

  it('should not merge other values with same reward', () => {
    const outcomes: Outcome[] = [
      { message: 'success', local: 1, remote: 0 },
      { message: 'maybe', local: 1, remote: 0 },
      { message: 'fail', local: 0.5, remote: 0.5 },
    ]

    const result = merge(outcomes)
    expect(result.length).toBe(3)
    expect(result[0].message).toBe('success')
    expect(result[0].local).toBe(1)
    expect(result[1].message).toBe('maybe')
    expect(result[1].local).toBe(1)
    expect(result[2].message).toBe('fail')
    expect(result[2].local).toBe(0.5)
  })

  it('should only merge sequential fixing prices with same reward', () => {
    const outcomes: Outcome[] = [
      { message: '1', local: 1, remote: 0 },
      { message: '3', local: 1, remote: 0 },
      { message: '4', local: 1, remote: 0 },
      { message: '5', local: 0, remote: 1 },
      { message: '6', local: 0, remote: 1 },
      { message: '7', local: 0, remote: 1 },
      { message: '8', local: 0, remote: 1 },
    ]

    const result = merge(outcomes)
    expect(result.length).toBe(3)
    expect(result[0].message).toBe('1')
    expect(result[0].local).toBe(1)
    expect(result[1].message).toBe('3-4')
    expect(result[1].local).toBe(1)
    expect(result[2].message).toBe('5-8')
    expect(result[2].local).toBe(0)
  })
})
