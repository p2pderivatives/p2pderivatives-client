import React, { FC } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import LoginForm, { LoginFormProps } from '../../organisms/LoginForm'
import { makeStyles, Typography, Link } from '@material-ui/core'

import p2plogo from '../../../assets/p2p-logo.png'
import graph from '../../../assets/logo-rb.png'

export type LoginTemplateProps = LoginFormProps

const useStyles = makeStyles({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
  },
  logoContainer: {
    width: '50%',
    position: 'relative',
    background: 'linear-gradient(180deg, #1F91B0 0%, #167792 100%)',
  },
  logo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  graph: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  loginSide: {
    width: '50%',
    background: '#303855',
    position: 'relative',
  },
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
    <div className={classes.rootContainer}>
      <div className={classes.logoContainer}>
        <div className={classes.logo}>
          <img src={p2plogo} alt="P2P-Derivatives" />
        </div>
        <div className={classes.graph}>
          <img src={graph} alt="Graph" />
        </div>
      </div>
      <div className={classes.loginSide}>
        <div className={classes.loginForm}>
          <LoginForm onSubmit={props.onSubmit} />
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
      </div>
    </div>
  )
}

export default LoginTemplate
