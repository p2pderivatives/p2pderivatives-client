import React, { FC, useState } from 'react'
import { Grid, Typography, makeStyles } from '@material-ui/core'
import TextInput from '../../atoms/TextInput'
import PasswordInput from '../../atoms/PasswordInput'
import Button from '../../atoms/Button'

export interface LoginFormProps {
  onSubmit: (username: string, password: string) => void
  error?: string
}

const useStyles = makeStyles({
  titleContainer: {
    height: '3.5rem',
  },
})

const LoginForm: FC<LoginFormProps> = (props: LoginFormProps) => {
  const classes = useStyles()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  return (
    <Grid container spacing={5} direction="column">
      <Grid item xs={12}>
        <div className={classes.titleContainer}>
          <Typography color="textPrimary" variant="h5" align="center">
            Login
          </Typography>
          {props.error && (
            <Typography color="error" variant="subtitle2" align="center">
              {props.error}
            </Typography>
          )}
        </div>
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
      <Grid item container xs={12} justify="center">
        <Button
          variant="contained"
          disabled={username === '' || password === ''}
          onClick={() => props.onSubmit(username, password)}
        >
          Login
        </Button>
      </Grid>
    </Grid>
  )
}

export default LoginForm
