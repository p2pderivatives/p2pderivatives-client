import { MenuItem } from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment'
import Select from '@material-ui/core/Select'
import { makeStyles, Theme } from '@material-ui/core/styles'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import React, { FC, ReactElement, useRef, useState } from 'react'

export type BitcoinInputProps = Omit<
  TextFieldProps,
  'color' | 'variant' | 'type' | 'value' | 'onChange'
> & {
  value?: number
  isBitcoin?: boolean
  onChange: (value: number) => void
  onCoinChange: (isBitcoin: boolean) => void
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
    '& .MuiFormHelperText-root:not(.Mui-error)': {
      color: theme.palette.text.secondary,
    },
    '& .Mui-disabled': {
      color: theme.palette.text.secondary,
    },
  },
}))

function toBtcString(value: number): string {
  let stringValue = value.toString()
  if (stringValue.length <= 8) {
    stringValue = stringValue.padStart(9, '0')
  }
  const sep = stringValue.length - 8
  const end = trimTrailingZeros(stringValue.slice(sep))
  const start = stringValue.slice(0, sep)
  if (end === '0' || end === '') {
    return start
  }
  return start + '.' + end
}

function toSatoshiString(value: string): string {
  if (value === '') return value
  const parts = value.split('.')
  if (parts.length === 1 || (parts.length === 2 && parts[1].length === 0)) {
    return trimLeadingZeros(parts[0] + ''.padEnd(8, '0'))
  }

  parts[1] = parts[1].padEnd(8, '0')

  return trimLeadingZeros(parts[0] + parts[1])
}

function toSatoshiNumber(value: string): number {
  const satoshis = parseInt(toSatoshiString(value))
  return satoshis
}

function getInitialValue(propValue?: number, isBitcoin = true): string {
  if (!propValue) return ''

  return isBitcoin ? toBtcString(propValue) : propValue.toString()
}

function trimLeadingZeros(value: string): string {
  return value.replace(/^0+(?=\d)/, '')
}

function trimTrailingZeros(value: string): string {
  return value.replace(/(\.?0*)$/, '')
}

const BitcoinInput: FC<BitcoinInputProps> = (props: BitcoinInputProps) => {
  const classes = useStyles()
  const { onChange, onCoinChange, isBitcoin, ...inputSubProps } = props
  const inputRef = useRef<HTMLInputElement>()
  const [value, setValue] = useState(
    getInitialValue(props.value, props.isBitcoin)
  )
  const [coinValue, setCoinValue] = useState(
    props.isBitcoin === undefined || props.isBitcoin === true ? 0 : 1
  )
  const coinValues = [
    { label: 'BTC', short: 'BTC' },
    { label: 'Satoshis', short: 'sats' },
  ]

  const isProperInput: (input: string) => boolean = (
    input: string
  ): boolean => {
    const bitcoinValidInput = /^(\d{1,8})(\.(\d{1,8})?)?$/
    const satoshiValidInput = /^\d{1,16}$/
    return (
      input === '' ||
      (coinValue === 0 && bitcoinValidInput.test(input)) ||
      (coinValue === 1 && satoshiValidInput.test(input))
    )
  }

  const handleValueChange = (
    event: React.ChangeEvent<{ value: string }>
  ): void => {
    let stringVal = event.target.value
    if (!isProperInput(stringVal)) {
      return
    }
    stringVal = trimLeadingZeros(stringVal)
    setValue(stringVal)
    if (stringVal === '' || isNaN(Number(stringVal))) {
      props.onChange(0)
      return
    }

    if (coinValue === 0) {
      const updated = toSatoshiNumber(stringVal)
      props.onChange(updated)
    } else {
      props.onChange(parseInt(stringVal))
    }
  }

  const handleCoinChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ): void => {
    const coinIdx = parseInt(event.target.value as string)
    if (coinIdx === coinValue) {
      return
    }
    setCoinValue(coinIdx)
    props.onCoinChange(coinIdx === 0)
    if (value === '') {
      return
    }
    if (coinIdx === 0) {
      setValue(toBtcString(parseInt(value)))
    } else {
      setValue(toSatoshiString(value))
    }
  }

  return (
    <TextField
      className={classes.root}
      {...inputSubProps}
      data-testid="bitcoin-input"
      value={value}
      inputRef={inputRef}
      onChange={handleValueChange}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Select
              data-testid="bitcoin-input-select"
              inputProps={{ 'data-testid': 'bitcoin-input-select-value' }}
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
