import React, { FC, useState, ReactElement } from 'react'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Select from '@material-ui/core/Select'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { MenuItem } from '@material-ui/core'

export type TextInputProps = Omit<
  TextFieldProps,
  'color' | 'variant' | 'type' | 'onChange'
> & {
  onChange: (satoshiValue: number) => void
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .MuiInputBase-root': {
      color: theme.palette.text.primary,
    },
    '& label.Mui-focused': {
      color: theme.palette.common.white,
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: theme.palette.common.white,
    },
    '& label': {
      color: theme.palette.text.secondary,
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: theme.palette.text.secondary,
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottomColor: theme.palette.common.white,
    },
    '& .MuiFormHelperText-root': {
      color: theme.palette.text.secondary,
    },
    '& .Mui-disabled': {
      color: theme.palette.text.secondary,
    },
  },
}))

const BitcoinInput: FC<TextInputProps> = (props: TextInputProps) => {
  const classes = useStyles()
  const [coinValue, setCoinValue] = useState(0)
  const coinValues = [
    { label: '₿ (BTC)', short: '₿' },
    { label: 's (Satoshi)', short: 's' },
  ]

  const handleValueChange = (
    event: React.ChangeEvent<{ value: string }>
  ): void => {
    let val = parseFloat(event.target.value)
    if (coinValue === 0) {
      val = val * 100000000
    }
    props.onChange(val)
  }

  const handleCoinChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ): void => {
    const coinIdx = parseInt(event.target.value as string)
    setCoinValue(coinIdx)
  }

  return (
    <TextField
      className={classes.root}
      {...props}
      type="number"
      onChange={handleValueChange}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Select
              value={coinValue}
              renderValue={(val): ReactElement => (
                <div>{coinValues[val as number].label}</div>
              )}
              onChange={handleCoinChange}
            >
              <MenuItem value="0">{coinValues[0].label}</MenuItem>
              <MenuItem value="1">{coinValues[1].label}</MenuItem>
            </Select>
          </InputAdornment>
        ),
      }}
    />
  )
}

export default BitcoinInput
