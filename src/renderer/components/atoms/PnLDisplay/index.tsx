import React, { FC } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, TypographyProps } from '@material-ui/core'

const useStyles = makeStyles({
  root: {
    color: (props: StyleProps) => props.color,
  },
})

export type PnLProps = TypographyProps & {
  value: number
}

type StyleProps = {
  color: string
}

const PnLDisplay: FC<PnLProps> = props => {
  const value = props.value
  const color = value < 0 ? 'red' : 'green'
  const classes = useStyles({ color })
  return (
    <Typography
      classes={{
        root: classes.root,
      }}
      {...props}
    >
      {props.value}
    </Typography>
  )
}

export default PnLDisplay
