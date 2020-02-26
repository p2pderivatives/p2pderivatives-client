import React, { FC, useState, useEffect } from 'react'
import { makeStyles, Container } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'

import Button from '../../atoms/Button'
import PasswordInput from '../../atoms/PasswordInput'

export type ChangePasswordDialogProps = {
  open?: boolean
  onClose: () => void
}

const useStyles = makeStyles({
  rootContainer: {
    margin: '3rem 0rem',
  },
  buttons: {
    textAlign: 'center',
    marginTop: '3rem',
    '& > button': {
      marginRight: '1rem',
    },
  },
})

const ChangePasswordDialog: FC<ChangePasswordDialogProps> = (
  props: ChangePasswordDialogProps
) => {
  const classes = useStyles()
  const [open, setOpen] = useState(props.open ? props.open : false)
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (props.open) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [props.open])

  return (
    <Dialog
      onClose={props.onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <DialogContent dividers>
        <Container className={classes.rootContainer}>
          <Typography variant="h6">Change your password</Typography>
          <PasswordInput
            fullWidth
            id="oldPassword"
            label="Current password"
            name="oldPassword"
            autoComplete="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
          />
          <PasswordInput
            fullWidth
            id="password"
            label="Password"
            name="password"
            autoComplete="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <PasswordInput
            fullWidth
            id="confirmPpassword"
            label="Confirm password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <div className={classes.buttons}>
            <Button variant="contained" color="primary">
              {'Add'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={props.onClose}
            >
              {'Cancel'}
            </Button>
          </div>
        </Container>
      </DialogContent>
    </Dialog>
  )
}

ChangePasswordDialog.defaultProps = {
  open: false,
}

export default ChangePasswordDialog
