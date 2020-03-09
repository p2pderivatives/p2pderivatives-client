import React, { FC } from 'react'
import MuiButton, { ButtonProps } from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    '&$disabled': {
      backgroundColor: '#686E82',
      color: theme.palette.text.secondary,
    },
  },
  disabled: {},
}))

const Button: FC<ButtonProps> = props => {
  const classes = useStyles()
  return (
    <MuiButton
      classes={{ root: classes.root, disabled: classes.disabled }}
      {...props}
    />
  )
}

export default Button
