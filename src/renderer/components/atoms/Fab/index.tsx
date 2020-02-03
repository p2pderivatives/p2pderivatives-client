import React, { FC } from 'react'
import MuiFab, { FabProps } from '@material-ui/core/Fab'
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
  label: {
    fontWeight: 'bold',
  },
  disabled: {},
})

const Fab: FC<FabProps> = props => {
  const classes = useStyles()
  return (
    <MuiThemeProvider theme={theme}>
      <MuiFab
        classes={{
          root: classes.root,
          disabled: classes.disabled,
          label: classes.label,
        }}
        {...props}
      />
    </MuiThemeProvider>
  )
}

export default Fab
