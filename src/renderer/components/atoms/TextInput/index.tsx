import React, { FC } from 'react'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

export type TextInputProps = Omit<TextFieldProps, 'color' | 'variant'> & {
  foreground?: string
  color?: string
  focusColor?: string
  hoverColor?: string
}

const useStyles = (
  foreground = '#E4E7EF',
  color = '#A2A6B4',
  focus = 'white',
  hover = 'white'
) =>
  makeStyles({
    root: {
      '& .MuiInputBase-root': {
        color: foreground,
      },
      '& label.Mui-focused': {
        color: focus,
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: focus,
      },
      '& label': {
        color: color,
      },
      '& .MuiInput-underline:before': {
        borderBottomColor: color,
      },
      '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
        borderBottomColor: hover,
      },
      '& .MuiFormHelperText-root': {
        color: color,
      },
      '& .Mui-disabled': {
        color: color,
      }
    },
  })()

const TextInput: FC<TextInputProps> = ({
  foreground,
  color,
  focusColor,
  hoverColor,
  ...props
}: TextInputProps) => {
  const classes = useStyles(foreground, color, focusColor, hoverColor)

  return <TextField className={classes.root} {...props} />
}

export default TextInput
