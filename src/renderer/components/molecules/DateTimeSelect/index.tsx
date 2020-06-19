import React, { FC, useState, useEffect, ReactElement } from 'react'
import { OracleAssetConfiguration } from '../../../../common/oracle/oracle'
import { FormControl, InputLabel, Select, makeStyles } from '@material-ui/core'
import { generateRange, DateSelection } from '../../../util/timerange-generator'
import { DateTime } from 'luxon'

type DateTimeSelectProps = {
  oracleInfo: OracleAssetConfiguration
  onChange: (value: DateTime) => void
  date?: DateTime
}

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 80,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}))

const DateTimeSelect: FC<DateTimeSelectProps> = (
  props: DateTimeSelectProps
) => {
  const classes = useStyles()
  const [yearOptions, setYearOptions] = useState<number[]>([])
  const [year, setYear] = useState(props.oracleInfo.startDate.year)
  const [monthOptions, setMonthOptions] = useState<number[]>([])
  const [month, setMonth] = useState(props.oracleInfo.startDate.month)
  const [dayOptions, setDayOptions] = useState<number[]>([])
  const [day, setDay] = useState(props.oracleInfo.startDate.day)
  const [hourOptions, setHourOptions] = useState<number[]>([])
  const [hour, setHour] = useState(props.oracleInfo.startDate.hour)
  const [minuteOptions, setMinuteOptions] = useState<number[]>([])
  const [minute, setMinute] = useState(props.oracleInfo.startDate.minute)

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
      <InputLabel>{label}</InputLabel>
      <Select
        native
        value={value}
        onChange={(event): void =>
          handleChange(setter, event.target.value as string)
        }
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
    })
    props.onChange(newDate)
  }

  const refreshOptions = (): void => {
    const dateSelection: DateSelection = {
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
    }
    const range = generateRange(props.oracleInfo, dateSelection)
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
  }, [props.oracleInfo, year, month, day, hour, minute])

  useEffect(() => {
    if (props.date) {
      setYear(props.date.year)
      setMonth(props.date.month)
      setDay(props.date.day)
      setHour(props.date.hour)
      setMinute(props.date.minute)
    }
  }, [])

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
