import React, { FC, useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, TypographyProps, Link } from '@material-ui/core'
import numbro from 'numbro'
import theme from '../../theme'

const useStyles = makeStyles(() => ({
  root: {
    color: (props: StyleProps): string => {
      return props.color ? props.color : theme.palette.text.primary
    },
  },
}))

export type BtcCurrency = 'sats' | 'BTC'

export type BtcDisplayProps = TypographyProps & {
  satValue: number
  currency: BtcCurrency
  pnlColors?: boolean
}

type StyleProps = {
  color: string
}

function toBtcDisplay(satValue: number): string {
  return numbro(satValue)
    .divide(100000000)
    .format({ thousandSeparated: true, mantissa: 8, trimMantissa: true })
}

function toSatDisplay(satValue: number): string {
  return numbro(satValue).format({
    thousandSeparated: true,
    mantissa: 8,
    trimMantissa: true,
  })
}

const BtcDisplay: FC<BtcDisplayProps> = (props: BtcDisplayProps) => {
  const { pnlColors, satValue, currency, ...typoProps } = props
  const color = props.pnlColors
    ? props.satValue < 0
      ? 'red'
      : theme.palette.primary.main
    : ''
  const classes = useStyles({ color })
  const [currencyState, setCurrencyState] = useState('sats')

  useEffect(() => {
    setCurrencyState(props.currency)
  }, [props.currency, setCurrencyState])

  const handleCurrencyClick = (): void => {
    currencyState === 'sats'
      ? setCurrencyState('BTC')
      : setCurrencyState('sats')
  }

  return (
    <>
      <Typography
        classes={{
          root: classes.root,
        }}
        {...typoProps}
      >
        <Link
          color="inherit"
          underline="none"
          onClick={handleCurrencyClick}
          style={{ cursor: 'pointer' }}
        >
          {currencyState === 'sats'
            ? toSatDisplay(props.satValue)
            : toBtcDisplay(props.satValue)}{' '}
          {currencyState}
        </Link>
      </Typography>
    </>
  )
}

export default BtcDisplay
