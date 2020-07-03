import { OracleAssetConfiguration } from '../../common/oracle/oracle'
import { DateTime, ToRelativeUnit, DurationObject, Duration } from 'luxon'

export interface DateSelection {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

export interface DateRanges {
  years: number[]
  months: number[]
  days: number[]
  hours: number[]
  minutes: number[]
}

function maxDateSelectionAndDateTime(
  dateTime: DateTime,
  dateSelection: DateSelection
): DateTime | DateSelection {
  return DateTime.max(DateTime.fromObject(dateSelection), dateTime)
}

export function getFirstValidDate(
  info: OracleAssetConfiguration,
  desiredDate: DateTime
): DateTime {
  let frequency = info.frequency.years
  let freqUnit: ToRelativeUnit = 'years'

  if (info.frequency.months > 0) {
    frequency = info.frequency.months
    freqUnit = 'months'
  } else if (info.frequency.days > 0) {
    frequency = info.frequency.days
    freqUnit = 'days'
  } else if (info.frequency.hours > 0) {
    frequency = info.frequency.hours
    freqUnit = 'hours'
  } else if (info.frequency.minutes > 0) {
    frequency = info.frequency.minutes
    freqUnit = 'minutes'
  }

  const duration = getFrequencyDiff(
    info.startDate,
    desiredDate,
    frequency,
    freqUnit
  )
  return info.startDate.plus(duration)
}

const generateArray = (
  start: number,
  end: number,
  frequency: number
): number[] => {
  const array: number[] = []
  const localFreq = frequency ? frequency : 1
  for (let i = start; i <= end; i += localFreq) array.push(i)
  return array
}

const getFrequencyDiff = (
  start: DateTime,
  future: DateTime,
  frequency: number,
  freqUnit: ToRelativeUnit
): Duration => {
  const dateDiff = future.diff(start, freqUnit)
  const freqDiv = dateDiff.get(freqUnit) / frequency
  const freqMul = Math.ceil(freqDiv)
  const durationObj: DurationObject = {}
  durationObj[freqUnit] = freqMul * frequency
  return Duration.fromObject(durationObj)
}

const getYears = (
  start: DateTime,
  info: OracleAssetConfiguration
): number[] => {
  const startYear = start.year
  const endYear = start.plus(info.range).year
  return generateArray(startYear, endYear, info.frequency.years)
}

const getMonths = (
  start: DateTime,
  info: OracleAssetConfiguration,
  year: number
): number[] => {
  let startMonth = start.month
  if (start.year !== year) {
    if (info.frequency.months > 0) {
      const futureDate = DateTime.fromObject({
        year: year,
        month: 1,
      })

      const addMonths = getFrequencyDiff(
        start,
        futureDate,
        info.frequency.months,
        'months'
      )
      startMonth = start.plus(addMonths).month
    } else {
      startMonth = 1
    }
  }
  let endMonth = 12

  const rangeEnd = start.plus(info.range)
  if (rangeEnd.year === year) {
    endMonth = start.plus(info.range).month
  }
  return generateArray(startMonth, endMonth, info.frequency.months)
}

const getDays = (
  start: DateTime,
  info: OracleAssetConfiguration,
  year: number,
  month: number
): number[] => {
  let startDay = start.day
  if (start.year !== year || start.month !== month) {
    if (info.frequency.days > 0) {
      const futureDate = DateTime.fromObject({
        year: year,
        month: month,
        day: 1,
      })
      const addDays = getFrequencyDiff(
        start,
        futureDate,
        info.frequency.days,
        'days'
      )
      startDay = start.plus(addDays).day
    } else {
      startDay = 1
    }
  }
  let endDay = DateTime.fromObject({ year: year, month: month }).daysInMonth

  const rangeEnd = start.plus(info.range)
  if (rangeEnd.year === year && rangeEnd.month === month) {
    endDay = rangeEnd.day
  }
  return generateArray(startDay, endDay, info.frequency.days)
}

const getHours = (
  start: DateTime,
  info: OracleAssetConfiguration,
  year: number,
  month: number,
  day: number
): number[] => {
  let startHour = start.hour
  if (start.year !== year || start.month !== month || start.day !== day) {
    if (info.frequency.hours > 0) {
      const futureDate = DateTime.fromObject({
        year: year,
        month: month,
        day: day,
        hour: 0,
      })
      const addHours = getFrequencyDiff(
        start,
        futureDate,
        info.frequency.hours,
        'hours'
      )
      startHour = start.plus(addHours).hour
    } else {
      startHour = 0
    }
  }
  let endHour = 23
  const rangeEnd = start.plus(info.range)
  if (
    rangeEnd.year === year &&
    rangeEnd.month === month &&
    rangeEnd.day === day
  ) {
    endHour = rangeEnd.hour
  }

  return generateArray(startHour, endHour, info.frequency.hours)
}

const getMinutes = (
  start: DateTime,
  info: OracleAssetConfiguration,
  year: number,
  month: number,
  day: number,
  hour: number
): number[] => {
  let startMinute = start.minute
  if (
    start.year !== year ||
    start.month !== month ||
    start.day !== day ||
    start.hour !== hour
  ) {
    if (info.frequency.minutes > 0) {
      const futureDate = DateTime.fromObject({
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: 0,
      })
      const addMinutes = getFrequencyDiff(
        start,
        futureDate,
        info.frequency.minutes,
        'minutes'
      )
      startMinute = start.plus(addMinutes).minute
    } else {
      startMinute = 0
    }
  }
  let endMinute = 59
  const rangeEnd = start.plus(info.range)
  if (
    rangeEnd.year === year &&
    rangeEnd.month === month &&
    rangeEnd.day === day &&
    rangeEnd.hour === hour
  ) {
    endMinute = rangeEnd.minute
  }

  return generateArray(startMinute, endMinute, info.frequency.minutes)
}

export const generateRange = (
  info: OracleAssetConfiguration,
  selection: DateSelection,
  minimumDate: DateTime
): DateRanges => {
  let localStart = info.startDate
  if (minimumDate > localStart) {
    localStart = getFirstValidDate(info, minimumDate)
  }
  selection = maxDateSelectionAndDateTime(localStart, selection)
  const currentYear = selection.year
  const currentMonth = selection.month
  const currentDay = selection.day
  const currentHour = selection.hour

  let intervalSet = info.frequency.years > 0
  const years = getYears(localStart, info)

  let months: number[] = [localStart.month]
  if (!intervalSet) {
    months = getMonths(localStart, info, currentYear)
    intervalSet = info.frequency.months > 0
  }

  let days: number[] = [localStart.day]
  if (!intervalSet) {
    days = getDays(localStart, info, currentYear, currentMonth)
    intervalSet = info.frequency.days > 0
  }

  let hours: number[] = [localStart.hour]
  if (!intervalSet) {
    hours = getHours(localStart, info, currentYear, currentMonth, currentDay)
    intervalSet = info.frequency.hours > 0
  }

  let minutes: number[] = [localStart.minute]
  if (!intervalSet) {
    minutes = getMinutes(
      localStart,
      info,
      currentYear,
      currentMonth,
      currentDay,
      currentHour
    )
  }

  return {
    years: years,
    months: months,
    days: days,
    hours: hours,
    minutes: minutes,
  }
}
