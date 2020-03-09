import React, { FC, useState } from 'react'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Select from '@material-ui/core/Select'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { MenuItem } from '@material-ui/core'

export type TextInputProps = Omit<TextFieldProps, 'color' | 'variant' | 'type'>

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

  const handleCoinChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const coinIdx = parseInt(event.target.value as string)
    setCoinValue(coinIdx)
  }

  return (
    <TextField
      className={classes.root}
      {...props}
      type="number"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Select
              value={coinValue}
              renderValue={val => <div>{coinValues[val as number].label}</div>}
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
