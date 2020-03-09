import React, { FC, useState } from 'react'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import { makeStyles, Theme } from '@material-ui/core/styles'

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

const TextInput: FC<TextInputProps> = (props: TextInputProps) => {
  const classes = useStyles()
  const [showPassword, setShowPassword] = useState(false)

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <TextField
      className={classes.root}
      {...props}
      type={showPassword ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}

export default TextInput
