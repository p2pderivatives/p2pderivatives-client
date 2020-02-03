import React, { FC, useState } from 'react'
import { Grid, Typography, makeStyles } from '@material-ui/core'
import TextInput from '../../atoms/TextInput'
import Button from '../../atoms/Button'

export interface LoginFormProps {
  onSubmit: (username: string, password: string) => void
  error?: string
}

const useStyles = makeStyles({
  title: {
    color: '#E4E7EF',
  },
})

const LoginForm: FC<LoginFormProps> = (props: LoginFormProps) => {
  const classes = useStyles()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  return (
    <Grid container spacing={5} direction="column">
      <Grid item xs={12}>
        <Typography className={classes.title} variant="h5" align="center">
          Login
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
        <TextInput
          fullWidth
          id="password"
          label="Password"
          name="password"
          type="password"
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
