import { RangeOutcome } from '../../../../common/models/dlc/RangeOutcome'
import {
  composeOutcomeValue,
  decomposeOutcomeValue,
  groupByIgnoringDigits,
  getMaxRanges,
} from '../Decomposition'

const decompositionTestCases: {
  decomposed: string[]
  composed: string
  base: number
  nbDigits: number
}[] = [
  {
    composed: '123456789',
    decomposed: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    base: 10,
    nbDigits: 9,
  },
  {
    composed: '4321',
    decomposed: [
      '1',
      '0',
      '0',
      '0',
      '0',
      '1',
      '1',
      '1',
      '0',
      '0',
      '0',
      '0',
      '1',
    ],
    base: 2,
    nbDigits: 13,
  },
  {
    composed: '0',
    decomposed: ['0', '0', '0', '0'],
    base: 8,
    nbDigits: 4,
  },
  {
    composed: '2',
    decomposed: ['0', '2'],
    base: 10,
    nbDigits: 2,
  },
  {
    composed: '1',
    decomposed: ['1'],
    base: 2,
    nbDigits: 1,
  },
]

const groupingTestCases: {
  startIndex: number
  endIndex: number
  base: number
  nbDigits: number
  expected: number[][]
}[] = [
  {
    startIndex: 123,
    endIndex: 123,
    base: 10,
    nbDigits: 3,
    expected: [[1, 2, 3]],
  },
  {
    startIndex: 171,
    endIndex: 210,
    base: 16,
    nbDigits: 2,
    expected: [
      [10, 11],
      [10, 12],
      [10, 13],
      [10, 14],
      [10, 15],
      [11],
      [12],
      [13, 0],
      [13, 1],
      [13, 2],
    ],
  },
  {
    startIndex: 73899,
    endIndex: 73938,
    base: 16,
    nbDigits: 6,
    expected: [
      [0, 1, 2, 0, 10, 11],
      [0, 1, 2, 0, 10, 12],
      [0, 1, 2, 0, 10, 13],
      [0, 1, 2, 0, 10, 14],
      [0, 1, 2, 0, 10, 15],
      [0, 1, 2, 0, 11],
      [0, 1, 2, 0, 12],
      [0, 1, 2, 0, 13, 0],
      [0, 1, 2, 0, 13, 1],
      [0, 1, 2, 0, 13, 2],
    ],
  },
  {
    startIndex: 1234,
    endIndex: 4321,
    base: 10,
    nbDigits: 4,
    expected: [
      [1, 2, 3, 4],
      [1, 2, 3, 5],
      [1, 2, 3, 6],
      [1, 2, 3, 7],
      [1, 2, 3, 8],
      [1, 2, 3, 9],
      [1, 2, 4],
      [1, 2, 5],
      [1, 2, 6],
      [1, 2, 7],
      [1, 2, 8],
      [1, 2, 9],
      [1, 3],
      [1, 4],
      [1, 5],
      [1, 6],
      [1, 7],
      [1, 8],
      [1, 9],
      [2],
      [3],
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3, 0],
      [4, 3, 1],
      [4, 3, 2, 0],
      [4, 3, 2, 1],
    ],
  },
  {
    startIndex: 1201234,
    endIndex: 1204321,
    base: 10,
    nbDigits: 8,
    expected: [
      [0, 1, 2, 0, 1, 2, 3, 4],
      [0, 1, 2, 0, 1, 2, 3, 5],
      [0, 1, 2, 0, 1, 2, 3, 6],
      [0, 1, 2, 0, 1, 2, 3, 7],
      [0, 1, 2, 0, 1, 2, 3, 8],
      [0, 1, 2, 0, 1, 2, 3, 9],
      [0, 1, 2, 0, 1, 2, 4],
      [0, 1, 2, 0, 1, 2, 5],
      [0, 1, 2, 0, 1, 2, 6],
      [0, 1, 2, 0, 1, 2, 7],
      [0, 1, 2, 0, 1, 2, 8],
      [0, 1, 2, 0, 1, 2, 9],
      [0, 1, 2, 0, 1, 3],
      [0, 1, 2, 0, 1, 4],
      [0, 1, 2, 0, 1, 5],
      [0, 1, 2, 0, 1, 6],
      [0, 1, 2, 0, 1, 7],
      [0, 1, 2, 0, 1, 8],
      [0, 1, 2, 0, 1, 9],
      [0, 1, 2, 0, 2],
      [0, 1, 2, 0, 3],
      [0, 1, 2, 0, 4, 0],
      [0, 1, 2, 0, 4, 1],
      [0, 1, 2, 0, 4, 2],
      [0, 1, 2, 0, 4, 3, 0],
      [0, 1, 2, 0, 4, 3, 1],
      [0, 1, 2, 0, 4, 3, 2, 0],
      [0, 1, 2, 0, 4, 3, 2, 1],
    ],
  },
  {
    startIndex: 2200,
    endIndex: 4999,
    base: 10,
    nbDigits: 4,
    expected: [
      [2, 2],
      [2, 3],
      [2, 4],
      [2, 5],
      [2, 6],
      [2, 7],
      [2, 8],
      [2, 9],
      [3],
      [4],
    ],
  },
  {
    startIndex: 0,
    endIndex: 99,
    base: 10,
    nbDigits: 2,
    expected: [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9]],
  },
  {
    startIndex: 100,
    endIndex: 199,
    base: 10,
    nbDigits: 3,
    expected: [[1]],
  },
  {
    startIndex: 100,
    endIndex: 200,
    base: 10,
    nbDigits: 3,
    expected: [[1], [2, 0, 0]],
  },
  {
    startIndex: 11,
    endIndex: 18,
    base: 10,
    nbDigits: 2,
    expected: [
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [1, 6],
      [1, 7],
      [1, 8],
    ],
  },
  {
    startIndex: 11,
    endIndex: 23,
    base: 2,
    nbDigits: 5,
    expected: [
      [0, 1, 0, 1, 1],
      [0, 1, 1],
      [1, 0],
    ],
  },
  {
    startIndex: 5677,
    endIndex: 8621,
    base: 2,
    nbDigits: 14,
    expected: [
      [0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1],
      [0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1],
      [0, 1, 0, 1, 1, 0, 0, 0, 1, 1],
      [0, 1, 0, 1, 1, 0, 0, 1],
      [0, 1, 0, 1, 1, 0, 1],
      [0, 1, 0, 1, 1, 1],
      [0, 1, 1],
      [1, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 1, 1, 0, 0],
      [1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
      [1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0],
      [1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0],
    ],
  },
]

const setMaxRangesTestCases: {
  original: RangeOutcome[]
  expected: RangeOutcome[]
  base: number
  nbNonces: number
}[] = [
  {
    original: [
      {
        start: 10,
        count: 10,
        payout: {
          local: 0,
          remote: 10,
        },
      },
      {
        start: 20,
        count: 10,
        payout: {
          local: 10,
          remote: 0,
        },
      },
    ],
    expected: [
      {
        start: 0,
        count: 20,
        payout: {
          local: 0,
          remote: 10,
        },
      },
      {
        start: 20,
        count: 80,
        payout: {
          local: 10,
          remote: 0,
        },
      },
    ],
    base: 10,
    nbNonces: 2,
  },
  {
    original: [
      {
        start: 10,
        count: 50,
        payout: {
          local: 0,
          remote: 10,
        },
      },
    ],
    expected: [
      {
        start: 0,
        count: 100,
        payout: {
          local: 0,
          remote: 10,
        },
      },
    ],
    base: 10,
    nbNonces: 2,
  },
  {
    original: [
      {
        start: 10,
        count: 10,
        payout: {
          local: 0,
          remote: 10,
        },
      },
      {
        start: 20,
        count: 10,
        payout: {
          local: 10,
          remote: 0,
        },
      },
    ],
    expected: [
      {
        start: 0,
        count: 20,
        payout: {
          local: 0,
          remote: 10,
        },
      },
      {
        start: 20,
        count: 12,
        payout: {
          local: 10,
          remote: 0,
        },
      },
    ],
    base: 2,
    nbNonces: 5,
  },
  {
    original: [
      {
        start: 0,
        count: 20,
        payout: {
          local: 0,
          remote: 10,
        },
      },
      {
        start: 20,
        count: 10,
        payout: {
          local: 10,
          remote: 0,
        },
      },
    ],
    expected: [
      {
        start: 0,
        count: 20,
        payout: {
          local: 0,
          remote: 10,
        },
      },
      {
        start: 20,
        count: 12,
        payout: {
          local: 10,
          remote: 0,
        },
      },
    ],
    base: 2,
    nbNonces: 5,
  },
]

describe('outcome (de)composition tests', () => {
  it('should properly compose values', () => {
    for (const test of decompositionTestCases) {
      expect(composeOutcomeValue(test.decomposed, test.base)).toEqual(
        test.composed
      )
    }
  })
  it('should properly decompose values', () => {
    for (const test of decompositionTestCases) {
      expect(
        decomposeOutcomeValue(test.composed, test.base, test.nbDigits)
      ).toEqual(test.decomposed)
    }
  })
})

describe('grouping tests', () => {
  it('should properly compute all groupings', () => {
    for (const test of groupingTestCases) {
      expect(
        groupByIgnoringDigits(
          test.startIndex,
          test.endIndex,
          test.base,
          test.nbDigits
        )
      ).toEqual(test.expected)
    }
  })
  it('should throw if invalid parameters are given', () => {
    expect(() => groupByIgnoringDigits(0, 100, 2, 5)).toThrow()
  })
})

describe('max range outcomes test', () => {
  it('should properly max range outcomes', () => {
    for (const test of setMaxRangesTestCases) {
      expect(getMaxRanges(test.original, test.base, test.nbNonces)).toEqual(
        test.expected
      )
    }
  })
  it('should return same object if already max range', () => {
    const test: RangeOutcome[] = [
      {
        start: 0,
        count: 50,
        payout: {
          local: 0,
          remote: 10,
        },
      },
      {
        start: 50,
        count: 50,
        payout: {
          remote: 0,
          local: 10,
        },
      },
    ]
    expect(getMaxRanges(test, 10, 2)).toBe(test)
  })
})
