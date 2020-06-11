import React, { FC, useState } from 'react'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { Typography, TypographyProps, Link } from '@material-ui/core'
import numeral from 'numeral'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: (props: StyleProps) => {
      return props.color ? props.color : theme.palette.text.primary
    },
  },
}))

export type PnLProps = TypographyProps & {
  value: number
  pnlColors?: boolean
}

type StyleProps = {
  color: string
}

const PnLDisplay: FC<PnLProps> = props => {
  const value = props.value
  const color = props.pnlColors ? (value < 0 ? 'red' : 'green') : ''
  const classes = useStyles({ color })
  const [currency, setCurrency] = useState('sats')
  const [displayedValue, setDisplayedValue] = useState(
    numeral(value).format('0,0')
  )

  const handleCurrencyClick = () => {
    currency == 'sats' ? toBTC() : toSats()
  }

  const toBTC = () => {
    setCurrency('BTC')
    setDisplayedValue(
      numeral(value)
        .divide(100000000)
        .format('0,0')
    )
  }

  const toSats = () => {
    setCurrency('sats')
    setDisplayedValue(numeral(value).format('0,0'))
  }

  return (
    <>
      <Typography
        classes={{
          root: classes.root,
        }}
        {...props}
      >
        <Link
          href="#"
          color="inherit"
          underline="none"
          onClick={() => handleCurrencyClick()}
        >
          {displayedValue} {currency}
        </Link>
      </Typography>
    </>
  )
}

export default PnLDisplay
