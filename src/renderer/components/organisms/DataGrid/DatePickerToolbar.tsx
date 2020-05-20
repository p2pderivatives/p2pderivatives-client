import React, { FC, useState } from 'react'
import DateFnsUtils from '@date-io/date-fns'
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers'

export type DatePickerToolbarProps = {
  fromDate: Date | undefined
  setFromDate: (date: Date) => void
  toDate: Date | undefined
  setToDate: (date: Date) => void
}

const DatePickerToolbar: FC<DatePickerToolbarProps> = (
  props: DatePickerToolbarProps
) => {
  const [localTo, setLocalTo] = useState(props.toDate)
  const [localFrom, setLocalFrom] = useState(props.fromDate)

  const handleToDateChange = (newDate: Date | null): void => {
    if (newDate) {
      props.setToDate(newDate)
      setLocalTo(newDate)
    }
  }

  const handleFromDateChange = (newDate: Date | null): void => {
    if (newDate) {
      props.setFromDate(newDate)
      setLocalFrom(newDate)
    }
  }

  return (
    <React.Fragment>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="yyyy/MM/dd"
          margin="dense"
          id="from-date-picker"
          label="From"
          value={localFrom}
          onChange={handleFromDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change from date',
          }}
          style={{ order: -2, marginRight: '0.5rem' }}
        />
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="yyyy/MM/dd"
          margin="dense"
          id="to-date-picker"
          label="To"
          value={localTo}
          onChange={handleToDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change to date',
          }}
          style={{ order: -1 }}
        />
      </MuiPickersUtilsProvider>
    </React.Fragment>
  )
}
DatePickerToolbar.displayName = 'DatePickerToolbar'

export default DatePickerToolbar
