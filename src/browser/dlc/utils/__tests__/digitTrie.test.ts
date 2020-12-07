import { DigitTrie, trieExplore, trieInsert, trieLookUp } from '../DigitTrie'

const testData = [
  [
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
  [
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
]

describe('DigitTrie test', () => {
  it('should return inserted elements', () => {
    const dt: DigitTrie<number> = { root: { edges: [] } }
    for (const data of testData) {
      for (let i = 0; i < data.length; i++) {
        trieInsert(dt, data[i], i)
      }

      for (let i = 0; i < data.length; i++) {
        expect(trieLookUp(dt, data[i])).toEqual({ value: i, path: data[i] })
      }
    }
  })
  it('should return value if querying with longer path', () => {
    const dt: DigitTrie<number> = { root: { edges: [] } }
    trieInsert(dt, [1, 2], 1)
    expect(trieLookUp(dt, [1, 2, 3])).toEqual({ value: 1, path: [1, 2] })
  })
  it('should throw if inserting leaf on common prefix', () => {
    const dt: DigitTrie<number> = { root: { edges: [] } }
    trieInsert(dt, [1, 2, 3, 4], 1)
    expect(() => trieInsert(dt, [1, 2], 2)).toThrow()
  })
  it('should throw if inserting with prefix that has leaf', () => {
    const dt: DigitTrie<number> = { root: { edges: [] } }
    trieInsert(dt, [1, 2], 1)
    expect(() => trieInsert(dt, [1, 2, 3], 2)).toThrow()
  })
  it('should replace data if inserting with path of existing leaf', () => {
    const dt: DigitTrie<number> = { root: { edges: [] } }

    trieInsert(dt, [1, 2], 1)
    trieInsert(dt, [1, 2], 2)
    expect(trieLookUp(dt, [1, 2])).toEqual({ value: 2, path: [1, 2] })
  })
  it('should throw if inserting with path that is mid-node', () => {
    const dt: DigitTrie<number> = { root: { edges: [] } }
    trieInsert(dt, [1, 2, 3], 1)
    trieInsert(dt, [1, 2, 4], 2)
    expect(() => trieInsert(dt, [1, 2], 3)).toThrow()
  })
  it('should throw if looking up non inserted path', () => {
    const dt: DigitTrie<number> = { root: { edges: [] } }
    trieInsert(dt, [1, 2, 3], 1)
    trieInsert(dt, [1, 2, 4], 1)
    trieInsert(dt, [2, 3, 4], 2)
    expect(() => trieLookUp(dt, [1, 2, 5])).toThrow()
    expect(() => trieLookUp(dt, [2])).toThrow()
    expect(() => trieLookUp(dt, [1])).toThrow()
    expect(() => trieLookUp(dt, [1, 3])).toThrow()
    expect(() => trieLookUp(dt, [2, 3, 5])).toThrow()
  })
  it('should yield the expected values when exploring', () => {
    for (const data of testData) {
      const dt: DigitTrie<number> = { root: { edges: [] } }
      for (let i = 0; i < data.length; i++) {
        trieInsert(dt, data[i], i)
      }
      let i = 0
      for (const res of trieExplore(dt)) {
        expect(res.path).toEqual(data[i])
        expect(res.data).toEqual(i++)
      }
      expect(i).toEqual(data.length)
    }
  })
})
