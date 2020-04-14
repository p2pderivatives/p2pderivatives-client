import React, { FC, useState } from 'react'
import { makeStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'

import Button from '../../atoms/Button'
import PasswordInput from '../../atoms/PasswordInput'

export type ChangePasswordFormProps = {
  onSubmit: (oldPassword: string, newPassword: string) => void
}

const useStyles = makeStyles({
  item: {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  buttons: {
    textAlign: 'center',
    marginTop: '3rem',
    '& > button': {
      marginRight: '1rem',
    },
  },
})

const ChangePasswordForm: FC<ChangePasswordFormProps> = (
  props: ChangePasswordFormProps
) => {
  const classes = useStyles()
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <div>
      <Grid
        container
        direction="column"
        justify="space-evenly"
        alignItems="stretch"
      >
        <Grid item xs={12} className={classes.item}>
          <PasswordInput
            fullWidth
            id="oldPassword"
            label="Current password"
            name="oldPassword"
            autoComplete="password"
            value={oldPassword}
            onChange={(e): void => setOldPassword(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <PasswordInput
            fullWidth
            id="password"
            label="Password"
            name="password"
            autoComplete="password"
            value={password}
            onChange={(e): void => setPassword(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <PasswordInput
            fullWidth
            id="confirmPassword"
            label="Confirm password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e): void => setConfirmPassword(e.target.value)}
          />
        </Grid>
      </Grid>
      <div className={classes.buttons}>
        <Button
          variant="contained"
          color="primary"
          disabled={password !== confirmPassword}
          onClick={(): void => props.onSubmit(oldPassword, password)}
        >
          {'Update'}
        </Button>
      </div>
    </div>
  )
}

export default ChangePasswordForm
