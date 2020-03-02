import React, { FC } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import LoginLayout from '../../organisms/LoginLayout'
import LoginForm, { LoginFormProps } from '../../organisms/LoginForm'
import { makeStyles, Typography, Link } from '@material-ui/core'

export type LoginTemplateProps = LoginFormProps

const useStyles = makeStyles({
  loginForm: {
    position: 'absolute',
    top: '50%',
    left: '25%',
    right: '25%',
    transform: 'translate(0%, -50%)',
  },
  registerText: {
    color: '#E4E7EF',
    textAlign: 'center',
    marginTop: '36px',
  },
  registerLink: {
    color: '#67B1F6',
  },
})

const LoginTemplate: FC<LoginTemplateProps> = (props: LoginTemplateProps) => {
  const classes = useStyles()
  return (
    <LoginLayout>
      <div className={classes.loginForm}>
        <LoginForm onSubmit={props.onSubmit} error={props.error} />
        <Typography className={classes.registerText}>
          {"Don't have an account? "}
          <Link
            className={classes.registerLink}
            component={RouterLink}
            to="/register"
            variant="body2"
          >
            Sign up
          </Link>
        </Typography>
      </div>
    </LoginLayout>
  )
}

export default LoginTemplate
