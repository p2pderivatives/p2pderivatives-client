import { makeStyles } from '@material-ui/core'
import React, { FC } from 'react'
import graph from '../../../assets/logo-rb.png'
import p2plogo from '../../../assets/p2p-logo.png'

type LayoutProps = {
  children?: React.ReactNode
}

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
})

const LoginLayout: FC<LayoutProps> = (props: LayoutProps) => {
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
      <div className={classes.loginSide}>{props.children}</div>
    </div>
  )
}

export default LoginLayout
