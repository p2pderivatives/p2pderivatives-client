import React, { FC, useState, useEffect, ReactElement } from 'react'
import { OracleAssetConfiguration } from '../../../../common/oracle/oracle'
import { FormControl, InputLabel, Select, makeStyles } from '@material-ui/core'
import {
  generateRange,
  getFirstValidDate,
} from '../../../util/timerange-generator'
import { DateTime } from 'luxon'

type DateTimeSelectProps = {
  oracleInfo: OracleAssetConfiguration
  onChange: (value: DateTime) => void
  date?: DateTime
  minimumDate: DateTime
}

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 80,
  },
  select: {
    '& .Mui-disabled': {
      color: theme.palette.text.secondary,
    },
  },
}))

const DateTimeSelect: FC<DateTimeSelectProps> = (
  props: DateTimeSelectProps
) => {
  let initialDate: DateTime
  const minimumValidDate = getFirstValidDate(
    props.oracleInfo,
    props.minimumDate
  )

  if (props.date) {
    initialDate = DateTime.max(props.date, minimumValidDate)
  } else {
    initialDate = minimumValidDate
  }

  const classes = useStyles()
  const [yearOptions, setYearOptions] = useState<number[]>([])
  const [year, setYear] = useState(initialDate.year)
  const [monthOptions, setMonthOptions] = useState<number[]>([])
  const [month, setMonth] = useState(initialDate.month)
  const [dayOptions, setDayOptions] = useState<number[]>([])
  const [day, setDay] = useState(initialDate.day)
  const [hourOptions, setHourOptions] = useState<number[]>([])
  const [hour, setHour] = useState(initialDate.hour)
  const [minuteOptions, setMinuteOptions] = useState<number[]>([])
  const [minute, setMinute] = useState(initialDate.minute)

  const handleChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: string
  ): void => {
    setter(parseInt(value))
  }

  const createSelect = (
    label: string,
    value: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
    options: number[]
  ): ReactElement => (
    <FormControl className={classes.formControl}>
      <InputLabel shrink={value !== null}>{label}</InputLabel>
      <Select
        className={classes.select}
        native
        disabled={options.length < 2}
        value={value}
        onChange={(event): void => {
          handleChange(setter, event.target.value as string)
        }}
      >
        {options.map(o => (
          <option value={o} key={o}>
            {o.toString().padStart(2, '0')}
          </option>
        ))}
      </Select>
    </FormControl>
  )

  const handleDateChange = (): void => {
    const newDate = DateTime.fromObject({
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
      zone: 'utc',
    })
    if (!props.date || !newDate.equals(props.date)) {
      props.onChange(newDate)
    }
  }

  const refreshOptions = (): void => {
    const dateSelection = DateTime.fromObject({
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
    })
    const range = generateRange(
      props.oracleInfo,
      dateSelection,
      props.minimumDate
    )
    setYearOptions(range.years)
    setMonthOptions(range.months)
    setDayOptions(range.days)
    setHourOptions(range.hours)
    setMinuteOptions(range.minutes)
  }

  useEffect(() => {
    refreshOptions()
    handleDateChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.oracleInfo, props.minimumDate, year, month, day, hour, minute])

  return (
    <div>
      {createSelect('Year', year, setYear, yearOptions)}
      {createSelect('Month', month, setMonth, monthOptions)}
      {createSelect('Day', day, setDay, dayOptions)}
      {createSelect('Hour', hour, setHour, hourOptions)}
      {createSelect('Minute', minute, setMinute, minuteOptions)}
    </div>
  )
}

export default DateTimeSelect
