import React, { FC } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import LoginLayout from '../../organisms/LoginLayout'
import RegisterForm, { RegisterFormProps } from '../../organisms/RegisterForm'
import { makeStyles, Typography, Link } from '@material-ui/core'

export type RegisterTemplateProps = RegisterFormProps

const useStyles = makeStyles({
  loginForm: {
    position: 'absolute',
    top: '50%',
    left: '25%',
    right: '25%',
    transform: 'translate(0%, -50%)',
  },
  loginText: {
    color: '#E4E7EF',
    textAlign: 'center',
    marginTop: '36px',
  },
  loginLink: {
    color: '#67B1F6',
  },
})

const RegisterTemplate: FC<RegisterTemplateProps> = (
  props: RegisterTemplateProps
) => {
  const classes = useStyles()
  return (
    <LoginLayout>
      <div className={classes.loginForm}>
        <RegisterForm onSubmit={props.onSubmit} />
        <Typography className={classes.loginText}>
          {'Do you have an account? '}
          <Link
            className={classes.loginLink}
            component={RouterLink}
            to="/"
            variant="body2"
          >
            Login
          </Link>
        </Typography>
      </div>
    </LoginLayout>
  )
}

export default RegisterTemplate
