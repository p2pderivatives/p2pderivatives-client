import React, { FC } from 'react'
import MuiFab, { FabProps } from '@material-ui/core/Fab'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    padding: '0 1.5rem',
    '&$disabled': {
      backgroundColor: '#686E82',
      color: theme.palette.text.secondary,
    },
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
    textTransform: 'none',
  },
  disabled: {},
}))

const Fab: FC<FabProps> = props => {
  const classes = useStyles()
  return (
    <MuiFab
      classes={{
        root: classes.root,
        disabled: classes.disabled,
        label: classes.label,
      }}
      {...props}
    />
  )
}

export default Fab
