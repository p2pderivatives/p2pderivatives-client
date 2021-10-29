import React, { FC, useState } from 'react'
import { Grid, Typography, makeStyles } from '@material-ui/core'
import TextInput from '../../atoms/TextInput'
import PasswordInput from '../../atoms/PasswordInput'
import Button from '../../atoms/Button'
import { useKeyHook } from '../../../util/use-key-hook'

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

  const handleEnterSubmit = (): void => {
    if (!(username === '' || password === '')) {
      props.onSubmit(username, password)
    }
  }
  const onEnterSubmit = useKeyHook('Enter', handleEnterSubmit)

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
          onChange={(e): void => setUsername(e.target.value)}
          onKeyPress={onEnterSubmit}
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
          onChange={(e): void => setPassword(e.target.value)}
          onKeyPress={onEnterSubmit}
        />
      </Grid>
      <Grid item container xs={12} justifyContent="center">
        <Button
          variant="contained"
          disabled={username === '' || password === ''}
          onClick={(): void => props.onSubmit(username, password)}
        >
          Login
        </Button>
      </Grid>
    </Grid>
  )
}

export default LoginForm
