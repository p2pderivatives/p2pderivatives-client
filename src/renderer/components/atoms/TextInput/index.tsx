import React, { FC } from 'react'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import { makeStyles, Theme } from '@material-ui/core/styles'

export type TextInputProps = Omit<TextFieldProps, 'color' | 'variant'>

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

const TextInput: FC<TextInputProps> = (props: TextInputProps) => {
  const classes = useStyles()
  return <TextField className={classes.root} {...props} />
}

export default TextInput
