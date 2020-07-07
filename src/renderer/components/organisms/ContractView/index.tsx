import { Grid, makeStyles, Typography } from '@material-ui/core'
import React, { FC, useState, useEffect, ReactElement } from 'react'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { Contract } from '../../../../common/models/dlc/Contract'
import Button from '../../atoms/Button'
import BtcDisplay from '../../atoms/BtcDisplay'
import { DateTime } from 'luxon'

export type ContractViewProps = {
  data: Contract
  acceptContract: () => void
  rejectContract: () => void
  cancel: () => void
}

type ContentType = ContentTypeString | ContentTypeBtc

type ContentTypeString = {
  title: string
  value: string
  btc?: boolean
}

type ContentTypeBtc = {
  title: string
  value: number
  btc: boolean
  addOwn?: boolean
  pnlColors?: boolean
}

function isBtc(val: ContentType): val is ContentTypeBtc {
  return val.btc !== undefined && val.btc
}

const useStyles = makeStyles({
  contractDiv: {
    width: '60%',
    marginTop: '1.5rem',
  },
  titleBorder: {
    width: '48rem',
    borderBottom: '1px solid #B3B6C2',
    margin: '1rem 0rem',
  },
  dataTitle: {
    fontWeight: 'bold',
  },
  buttonDiv: {
    display: 'flex',
    justifyContent: 'space-evenly',
    marginTop: '3rem',
  },
})

function getGridItem(
  title: string,
  content: ReactElement,
  dataTitle: string
): ReactElement {
  return (
    <Grid item xs={4}>
      <div>
        <Typography className={dataTitle} variant="body2" color="textPrimary">
          {title}
        </Typography>
        {content}
      </div>
    </Grid>
  )
}

function getTypographyGridItem(
  title: string,
  content: string,
  dataTitle: string
): ReactElement {
  const reactElement = (
    <Typography variant="body2" color="textPrimary">
      {content}
    </Typography>
  )

  return getGridItem(title, reactElement, dataTitle)
}

function getBtcDisplayGridItem(
  title: string,
  satValue: number,
  dataTitle: string,
  addOwn?: boolean,
  pnlColors?: boolean
): ReactElement {
  const reactElement = (
    <>
      <BtcDisplay
        pnlColors={pnlColors}
        satValue={satValue}
        currency="BTC"
        variant="body2"
      />
      {addOwn && (
        <Typography variant="body2" color="textPrimary">
          (own)
        </Typography>
      )}
    </>
  )

  return getGridItem(title, reactElement, dataTitle)
}

const ContractView: FC<ContractViewProps> = (props: ContractViewProps) => {
  const classes = useStyles()
  const [contract, setContract] = useState(props.data)
  const [isProposal, setIsProposal] = useState(false)

  useEffect(() => {
    setContract(props.data)
    setIsProposal(
      contract.state === ContractState.Offered && !contract.isLocalParty
    )
  }, [contract, setContract, props.data])

  const handleAccept = (): void => {
    props.acceptContract()
  }

  const handleReject = (): void => {
    props.rejectContract()
  }

  const handleCancel = (): void => {
    props.cancel()
  }

  let content: ContentType[] = [
    { title: 'State', value: ContractState[contract.state] },
    {
      title: 'Maturity Date',
      value: DateTime.fromMillis(contract.maturityTime, {
        zone: 'utc',
      }).toLocaleString(DateTime.DATETIME_FULL),
    },
    { title: 'Counter Party', value: contract.counterPartyName },
    { title: 'Fee Rate (satoshi/vbytes)', value: contract.feeRate.toString() },
    {
      title: 'Local Collateral',
      value: contract.localCollateral,
      btc: true,
      addOwn: contract.isLocalParty,
    },
    {
      title: 'Remote Collateral',
      value: contract.remoteCollateral,
      btc: true,
      addOwn: !contract.isLocalParty,
    },
  ]

  if (contract.finalOutcome) {
    const pnl = contract.isLocalParty
      ? contract.finalOutcome.local - contract.localCollateral
      : contract.finalOutcome.remote - contract.remoteCollateral

    content = content.concat([
      { title: 'Outcome Value', value: contract.finalOutcome.message },
      {
        title: 'Local Payout',
        value: contract.finalOutcome.local,
        btc: true,
        addOwn: contract.isLocalParty,
      },
      {
        title: 'Remote Payout',
        value: contract.finalOutcome.remote,
        btc: true,
        addOwn: !contract.isLocalParty,
      },
      { title: 'PnL', value: pnl, btc: true, pnlColors: true },
    ])
  }

  const getDisplayContent = (): ReactElement[] => {
    const gridItems: ReactElement[] = []
    for (const element of content) {
      if (isBtc(element)) {
        gridItems.push(
          getBtcDisplayGridItem(
            element.title,
            element.value,
            classes.dataTitle,
            element.addOwn,
            element.pnlColors
          )
        )
      } else {
        gridItems.push(
          getTypographyGridItem(element.title, element.value, classes.dataTitle)
        )
      }
    }
    return gridItems
  }

  return (
    <div className={classes.contractDiv}>
      <Typography variant="h4" color="textPrimary">
        {contract.id}
      </Typography>
      <div className={classes.titleBorder}></div>
      <Grid container spacing={3}>
        {getDisplayContent()}
      </Grid>
      <div className={classes.buttonDiv}>
        {isProposal && (
          <>
            <Button variant="contained" color="primary" onClick={handleAccept}>
              Accept
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleReject}
            >
              Reject
            </Button>
          </>
        )}
        <Button variant="contained" color="secondary" onClick={handleCancel}>
          Back
        </Button>
      </div>
    </div>
  )
}

export default ContractView
