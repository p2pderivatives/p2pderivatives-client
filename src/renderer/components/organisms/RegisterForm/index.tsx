import React, { FC, useState } from 'react'
import { Grid, Typography } from '@material-ui/core'
import TextInput from '../../atoms/TextInput'
import PasswordInput from '../../atoms/PasswordInput'
import Button from '../../atoms/Button'

export interface RegisterFormProps {
  onSubmit: (username: string, password: string) => void
  error?: string
}

const LoginForm: FC<RegisterFormProps> = (props: RegisterFormProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <Grid container spacing={5} direction="column">
      <Grid item xs={12}>
        <Typography color="textPrimary" variant="h5" align="center">
          Register
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextInput
          label="ID"
          fullWidth
          id="username"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <PasswordInput
          fullWidth
          id="password"
          label="Password"
          name="password"
          autoComplete="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <PasswordInput
          fullWidth
          id="confirmPpassword"
          label="Confirm password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
      </Grid>
      <Grid item container xs={12} justify="center">
        <Button
          variant="contained"
          disabled={
            username === '' || password === '' || confirmPassword !== password
          }
          onClick={() => props.onSubmit(username, password)}
        >
          Register
        </Button>
      </Grid>
    </Grid>
  )
}

export default LoginForm
