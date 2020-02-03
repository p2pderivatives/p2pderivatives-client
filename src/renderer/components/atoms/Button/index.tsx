import React, { FC } from 'react'
import MuiButton, { ButtonProps } from '@material-ui/core/Button'
import {
  MuiThemeProvider,
  createMuiTheme,
  makeStyles,
} from '@material-ui/core/styles'

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#69F8C4',
      main: '#3AF3B1',
      dark: '#09E998',
    },
    secondary: {
      light: '#FFFFFF',
      main: '#E4E7EF',
      dark: '#B3B6C2',
    },
  },
})

const useStyles = makeStyles({
  root: {
    '&$disabled': {
      backgroundColor: '#686E82',
      color: '#A2A6B4',
    },
  },
  disabled: {},
})

const Button: FC<ButtonProps> = props => {
  const classes = useStyles()
  return (
    <MuiThemeProvider theme={theme}>
      <MuiButton
        classes={{ root: classes.root, disabled: classes.disabled }}
        {...props}
      />
    </MuiThemeProvider>
  )
}

export default Button
