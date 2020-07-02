import { generateRange } from '../timerange-generator'
import { OracleAssetConfiguration } from '../../../common/oracle/oracle'
import { DateTime, Duration } from 'luxon'

describe('timerange generator tests', () => {
  it('should generate correctly for range P1W and freq T1H', () => {
    const info: OracleAssetConfiguration = {
      startDate: DateTime.fromObject({
        year: 2020,
        month: 6,
        day: 10,
        hour: 13,
        minute: 0,
      }),
      frequency: Duration.fromObject({ hours: 1 }),
      range: Duration.fromObject({ weeks: 1 }),
    }

    const ranges = generateRange(info, info.startDate)
    expect(ranges.years).toStrictEqual([2020])
    expect(ranges.months).toStrictEqual([6])
    expect(ranges.days).toStrictEqual([10, 11, 12, 13, 14, 15, 16, 17])
    expect(ranges.hours).toStrictEqual([
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
    ])
    expect(ranges.minutes).toStrictEqual([0])
  })

  it('should generate correctly for range P1W and freq T1H when set to last possible date', () => {
    const info: OracleAssetConfiguration = {
      startDate: DateTime.fromObject({
        year: 2020,
        month: 6,
        day: 10,
        hour: 13,
        minute: 0,
      }),
      frequency: Duration.fromObject({ hours: 1 }),
      range: Duration.fromObject({ weeks: 1 }),
    }

    const ranges = generateRange(info, {
      year: 2020,
      month: 6,
      day: 17,
      hour: 0,
      minute: 0,
    })
    expect(ranges.years).toStrictEqual([2020])
    expect(ranges.months).toStrictEqual([6])
    expect(ranges.days).toStrictEqual([10, 11, 12, 13, 14, 15, 16, 17])
    expect(ranges.hours).toStrictEqual([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
    ])
    expect(ranges.minutes).toStrictEqual([0])
  })

  it('should generate correctly range T2H and freq T5M for first hour', () => {
    const info: OracleAssetConfiguration = {
      startDate: DateTime.fromObject({
        year: 2020,
        month: 6,
        day: 10,
        hour: 13,
        minute: 47,
      }),
      frequency: Duration.fromObject({ minute: 5 }),
      range: Duration.fromObject({ hours: 2 }),
    }

    const ranges = generateRange(info, {
      year: 2020,
      month: 6,
      day: 10,
      hour: 13,
      minute: 47,
    })
    expect(ranges.years).toStrictEqual([2020])
    expect(ranges.months).toStrictEqual([6])
    expect(ranges.days).toStrictEqual([10])
    expect(ranges.hours).toStrictEqual([13, 14, 15])
    expect(ranges.minutes).toStrictEqual([47, 52, 57])
  })

  it('should generate correctly range T2H and freq T5M for last hour', () => {
    const info: OracleAssetConfiguration = {
      startDate: DateTime.fromObject({
        year: 2020,
        month: 6,
        day: 10,
        hour: 13,
        minute: 47,
      }),
      frequency: Duration.fromObject({ minute: 5 }),
      range: Duration.fromObject({ hours: 2 }),
    }

    const ranges = generateRange(info, {
      year: 2020,
      month: 6,
      day: 10,
      hour: 15,
      minute: 47,
    })
    expect(ranges.years).toStrictEqual([2020])
    expect(ranges.months).toStrictEqual([6])
    expect(ranges.days).toStrictEqual([10])
    expect(ranges.hours).toStrictEqual([13, 14, 15])
    expect(ranges.minutes).toStrictEqual([2, 7, 12, 17, 22, 27, 32, 37, 42, 47])
  })

  it('should generate correctly for range P2Y and freq P2M', () => {
    const info: OracleAssetConfiguration = {
      startDate: DateTime.fromObject({
        year: 2020,
        month: 6,
        day: 10,
        hour: 13,
        minute: 5,
      }),
      frequency: Duration.fromObject({ months: 2 }),
      range: Duration.fromObject({ years: 2 }),
    }

    const ranges = generateRange(info, info.startDate)
    expect(ranges.years).toStrictEqual([2020, 2021, 2022])
    expect(ranges.months).toStrictEqual([6, 8, 10, 12])
    expect(ranges.days).toStrictEqual([10])
    expect(ranges.hours).toStrictEqual([13])
    expect(ranges.minutes).toStrictEqual([5])
  })

  it('should generate correctly for range P2Y and freq P2M in last year', () => {
    const info: OracleAssetConfiguration = {
      startDate: DateTime.fromObject({
        year: 2020,
        month: 6,
        day: 10,
        hour: 13,
        minute: 0,
      }),
      frequency: Duration.fromObject({ months: 2 }),
      range: Duration.fromObject({ years: 2 }),
    }

    const ranges = generateRange(info, {
      year: 2022,
      month: 0,
      day: 0,
      hour: 0,
      minute: 0,
    })
    expect(ranges.years).toStrictEqual([2020, 2021, 2022])
    expect(ranges.months).toStrictEqual([2, 4, 6])
    expect(ranges.days).toStrictEqual([10])
    expect(ranges.hours).toStrictEqual([13])
    expect(ranges.minutes).toStrictEqual([0])
  })

  it('should generate first possible hour on day after start date correctly', () => {
    const info: OracleAssetConfiguration = {
      startDate: DateTime.fromObject({
        year: 2020,
        month: 6,
        day: 10,
        hour: 13,
        minute: 0,
      }),
      frequency: Duration.fromObject({ hours: 2 }),
      range: Duration.fromObject({ weeks: 1 }),
    }

    const ranges = generateRange(info, {
      year: 2020,
      month: 6,
      day: 11,
      hour: 0,
      minute: 0,
    })
    expect(ranges.years).toStrictEqual([2020])
    expect(ranges.months).toStrictEqual([6])
    expect(ranges.days).toStrictEqual([10, 11, 12, 13, 14, 15, 16, 17])
    expect(ranges.hours).toStrictEqual([
      1,
      3,
      5,
      7,
      9,
      11,
      13,
      15,
      17,
      19,
      21,
      23,
    ])
    expect(ranges.minutes).toStrictEqual([0])
  })

  it('should generate correctly for range P2Y and freq P2M when using optional minimum date', () => {
    const info: OracleAssetConfiguration = {
      startDate: DateTime.fromObject({
        year: 2020,
        month: 6,
        day: 10,
        hour: 13,
        minute: 5,
      }),
      frequency: Duration.fromObject({ months: 2 }),
      range: Duration.fromObject({ years: 2 }),
    }

    const minDate = DateTime.fromObject({ year: 2021, month: 8 })

    const ranges = generateRange(info, info.startDate, minDate)
    expect(ranges.years).toStrictEqual([2021, 2022])
    expect(ranges.months).toStrictEqual([8, 10, 12])
    expect(ranges.days).toStrictEqual([10])
    expect(ranges.hours).toStrictEqual([13])
    expect(ranges.minutes).toStrictEqual([5])
  })

  it('should generate correctly for range P2Y and freq T5M when using optional minimum date', () => {
    const info: OracleAssetConfiguration = {
      startDate: DateTime.fromObject({
        year: 2020,
        month: 6,
        day: 10,
        hour: 13,
        minute: 5,
      }),
      frequency: Duration.fromObject({ minutes: 5 }),
      range: Duration.fromObject({ years: 2 }),
    }

    const minDate = DateTime.fromObject({
      year: 2021,
      month: 8,
      day: 25,
      hour: 20,
      minute: 30,
    })

    const ranges = generateRange(info, info.startDate, minDate)
    expect(ranges.years).toStrictEqual([2021, 2022])
    expect(ranges.months).toStrictEqual([8, 9, 10, 11, 12])
    expect(ranges.days).toStrictEqual([25, 26, 27, 28, 29, 30, 31])
    expect(ranges.hours).toStrictEqual([20, 21, 22, 23])
    expect(ranges.minutes).toStrictEqual([30, 35, 40, 45, 50, 55])
  })

  it('should generate correctly for range P2Y and freq T5M when using optional minimum date and selection date', () => {
    const info: OracleAssetConfiguration = {
      startDate: DateTime.fromObject({
        year: 2020,
        month: 6,
        day: 10,
        hour: 13,
        minute: 5,
      }),
      frequency: Duration.fromObject({ minutes: 5 }),
      range: Duration.fromObject({ years: 2 }),
    }

    const minDate = DateTime.fromObject({
      year: 2021,
      month: 8,
      day: 25,
      hour: 20,
      minute: 30,
    })

    const selectionDate = DateTime.fromObject({
      year: 2020,
      month: 6,
      day: 10,
      hour: 14,
      minute: 5,
    })

    const ranges = generateRange(info, selectionDate, minDate)
    expect(ranges.years).toStrictEqual([2021, 2022])
    expect(ranges.months).toStrictEqual([8, 9, 10, 11, 12])
    expect(ranges.days).toStrictEqual([25, 26, 27, 28, 29, 30, 31])
    expect(ranges.hours).toStrictEqual([20, 21, 22, 23])
    expect(ranges.minutes).toStrictEqual([30, 35, 40, 45, 50, 55])
  })
})
