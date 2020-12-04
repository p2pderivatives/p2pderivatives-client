import IOAPI from '..'

const api = new IOAPI()

describe('ioAPI-tests', () => {
  test('can read simple range outcome', async () => {
    const outcomeList = await api.readRangeOutcomes(
      './src/browser/api/io/__tests__/testRangeOutcomesSimple.csv'
    )
    expect(outcomeList.length).toBe(11)
    expect(outcomeList[0].start).toBe(2000)
    expect(outcomeList[0].count).toBe(1)
    expect(outcomeList[10].start).toBe(2010)
    expect(outcomeList[10].count).toBe(1)
  })
  test('can read empty range outcome', async () => {
    const outcomeList = await api.readRangeOutcomes(
      './src/browser/api/io/__tests__/testRangeOutcomesEmpty.csv'
    )
    expect(outcomeList.length).toBe(0)
  })
  test('can read unordered simple range outcome', async () => {
    const outcomeList = await api.readRangeOutcomes(
      './src/browser/api/io/__tests__/testRangeOutcomesSimpleUnordered.csv'
    )
    expect(outcomeList.length).toBe(11)
    expect(outcomeList[0].start).toBe(2000)
    expect(outcomeList[0].count).toBe(1)
    expect(outcomeList[10].start).toBe(2010)
    expect(outcomeList[10].count).toBe(1)
  })
  test('can read range outcome with range values', async () => {
    const outcomeList = await api.readRangeOutcomes(
      './src/browser/api/io/__tests__/testRangeOutcomesSimpleRange.csv'
    )
    expect(outcomeList.length).toBe(2)
    expect(outcomeList[0].start).toBe(2000)
    expect(outcomeList[0].count).toBe(6)
    expect(outcomeList[1].start).toBe(2006)
    expect(outcomeList[1].count).toBe(5)
  })
  test('can read range outcome with range values unordered', async () => {
    const outcomeList = await api.readRangeOutcomes(
      './src/browser/api/io/__tests__/testRangeOutcomesSimpleRangeUnordered.csv'
    )
    expect(outcomeList.length).toBe(2)
    expect(outcomeList[0].start).toBe(2000)
    expect(outcomeList[0].count).toBe(6)
    expect(outcomeList[1].start).toBe(2006)
    expect(outcomeList[1].count).toBe(5)
  })
  test('can read with single payout are merged', async () => {
    const outcomeList = await api.readRangeOutcomes(
      './src/browser/api/io/__tests__/testRangeOutcomesSimpleSamePayouts.csv'
    )
    expect(outcomeList.length).toBe(2)
    expect(outcomeList[0].start).toBe(2000)
    expect(outcomeList[0].count).toBe(6)
    expect(outcomeList[1].start).toBe(2006)
    expect(outcomeList[1].count).toBe(5)
  })
  test('csv contains invalid message throws', async () => {
    await expect(
      api.readRangeOutcomes(
        './src/browser/api/io/__tests__/testRangeOutcomesInvalidOutcome.csv'
      )
    ).rejects.toBeDefined()
  })
  test('csv contains invalid message range throws', async () => {
    await expect(
      api.readRangeOutcomes(
        './src/browser/api/io/__tests__/testRangeOutcomesInvalidOutcomeRange.csv'
      )
    ).rejects.toBeDefined()
    await expect(
      api.readRangeOutcomes(
        './src/browser/api/io/__tests__/testRangeOutcomesInvalidOutcomeRange2.csv'
      )
    ).rejects.toBeDefined()
  })
  test('csv contains invalid payout throws', async () => {
    await expect(
      api.readRangeOutcomes(
        './src/browser/api/io/__tests__/testRangeOutcomesInvalidPayout.csv'
      )
    ).rejects.toBeDefined()
  })
  test('csv contains invalid overlapping values throws', async () => {
    await expect(
      api.readRangeOutcomes(
        './src/browser/api/io/__tests__/testRangeOutcomesOverlap.csv'
      )
    ).rejects.toBeDefined()
    await expect(
      api.readRangeOutcomes(
        './src/browser/api/io/__tests__/testRangeOutcomesOverlap2.csv'
      )
    ).rejects.toBeDefined()
    await expect(
      api.readRangeOutcomes(
        './src/browser/api/io/__tests__/testRangeOutcomesOverlap3.csv'
      )
    ).rejects.toBeDefined()
  })
  test('simple enumeration outcomes valid succeeds', async () => {
    const outcomeList = await api.readEnumerationOutcomes(
      './src/browser/api/io/__tests__/testEnumerationOutcomesSimple.csv'
    )
    expect(outcomeList.length).toBe(4)
  })
})
