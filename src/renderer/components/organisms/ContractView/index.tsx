import { Grid, makeStyles, Typography } from '@material-ui/core'
import React, { FC } from 'react'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { ContractSimple } from '../../../../common/models/ipc/ContractSimple'
import Button from '../../atoms/Button'
import PnLDisplay from '../../atoms/PnLDisplay'

export type ContractViewProps = {
  data: ContractSimple
  acceptContract?: () => void
  rejectContract?: () => void
  cancel?: () => void
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

function computePnL(contract: ContractSimple) {
  if (!contract.finalOutcome) {
    throw new Error('Invalid state')
  }
  return contract.isLocalParty
    ? contract.finalOutcome.local - contract.localCollateral
    : contract.finalOutcome.remote - contract.remoteCollateral
}

const ContractView: FC<ContractViewProps> = (props: ContractViewProps) => {
  const classes = useStyles()
  const contract = props.data
  const isProposal =
    contract.state == ContractState.Offered && !contract.isLocalParty

  const handleAccept = (): void => {
    if (props.acceptContract) props.acceptContract()
  }

  const handleReject = (): void => {
    if (props.rejectContract) props.rejectContract()
  }

  const handleCancel = (): void => {
    if (props.cancel) props.cancel()
  }

  return (
    <div className={classes.contractDiv}>
      <Typography variant="h4" color="textPrimary">
        {contract.id}
      </Typography>
      <div className={classes.titleBorder}></div>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <div>
            <Typography
              className={classes.dataTitle}
              variant="body2"
              color="textPrimary"
            >
              State
            </Typography>
            <Typography variant="body2" color="textPrimary">
              {ContractState[contract.state]}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={4}>
          <div>
            <Typography
              className={classes.dataTitle}
              variant="body2"
              color="textPrimary"
            >
              Maturity Date (GMT)
            </Typography>
            <Typography variant="body2" color="textPrimary">
              {contract.maturityTime}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={4}>
          <div>
            <Typography
              className={classes.dataTitle}
              variant="body2"
              color="textPrimary"
            >
              Counter Party
            </Typography>
            <Typography variant="body2" color="textPrimary">
              {contract.counterPartyName}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={4}>
          <div>
            <Typography
              className={classes.dataTitle}
              variant="body2"
              color="textPrimary"
            >
              Fee rate (satoshi/vbyte)
            </Typography>
            <Typography variant="body2" color="textPrimary">
              {contract.feeRate}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={4}>
          <div>
            <Typography
              className={classes.dataTitle}
              variant="body2"
              color="textPrimary"
            >
              Local Collateral (Satoshi)
            </Typography>
            <Typography variant="body2" color="textPrimary">
              {contract.localCollateral}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={4}>
          <div>
            <Typography
              className={classes.dataTitle}
              variant="body2"
              color="textPrimary"
            >
              Remote Collateral (Satoshi)
            </Typography>
            <Typography variant="body2" color="textPrimary">
              {contract.remoteCollateral}
            </Typography>
          </div>
        </Grid>
        {contract.finalOutcome && (
          <>
            <Grid item xs={4}>
              <div>
                <Typography
                  className={classes.dataTitle}
                  variant="body2"
                  color="textPrimary"
                >
                  Outcome value
                </Typography>
                <Typography variant="body2" color="textPrimary">
                  {contract.finalOutcome.message}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography
                  className={classes.dataTitle}
                  variant="body2"
                  color="textPrimary"
                >
                  Local payout
                </Typography>
                <PnLDisplay
                  value={contract.finalOutcome.local}
                  variant="body2"
                />
                <Typography variant="body2" color="textPrimary">
                  {contract.isLocalParty ? '' : '(own)'}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography
                  className={classes.dataTitle}
                  variant="body2"
                  color="textPrimary"
                >
                  Remote payout
                </Typography>
                <PnLDisplay
                  value={contract.finalOutcome.remote}
                  variant="body2"
                />
                <Typography variant="body2" color="textPrimary">
                  {!contract.isLocalParty ? '' : '(own)'}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div>
                <Typography
                  className={classes.dataTitle}
                  variant="body2"
                  color="textPrimary"
                >
                  PnL payout
                </Typography>
                <PnLDisplay
                  pnlColors={true}
                  value={computePnL(contract)}
                  variant="body2"
                />
              </div>
            </Grid>
          </>
        )}
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
