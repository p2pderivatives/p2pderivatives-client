import React, { FC, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { makeStyles } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

import StatusBar from '../../molecules/StatusBar'
import Fab from '../../atoms/Fab'

import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'

import { useStatusBarContext } from '../../../providers/StatusBar'

export type LayoutProps = {
  onBack?: () => void
  children?: React.ReactNode
  showSidebar?: boolean
  settingsConfig?: boolean
}

const useStyles = makeStyles({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#303855',
  },
  paper: {
    backgroundColor: '#303855',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  buttonLink: {
    textDecoration: 'none',
  },
  contentRoot: {
    height: '100%',
    flexGrow: 2,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'auto',
  },
  sidebar: {
    flexBasis: '20%',
  },
  content: {
    flexGrow: 2,
    display: 'flex',
    flexDirection: 'column',
  },
})

const MainLayout: FC<LayoutProps> = (props: LayoutProps) => {
  const classes = useStyles()
  const statusBarContext = useStatusBarContext()

  const [username, setUsername] = useState('')
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    getUsername()
    getBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getUsername = async (): Promise<void> => {
    const user = await statusBarContext.getUser()
    setUsername(user)
  }

  const getBalance = async (): Promise<void> => {
    const balance = await statusBarContext.getBalance()
    setBalance(balance)
  }

  const handleRefresh = (): void => {
    getBalance()
  }

  return (
    <div className={classes.rootContainer}>
      <StatusBar
        username={username}
        balance={balance}
        refresh={handleRefresh}
      />
      <div className={classes.contentRoot}>
        {props.showSidebar && (
          <div className={classes.sidebar}>
            {props.settingsConfig ? (
              <Paper className={classes.paper} elevation={4} variant="outlined">
                <MenuList>
                  <MenuItem
                    onClick={(): void =>
                      props.onBack !== undefined ? props.onBack() : void 0
                    }
                  >
                    🠐 Back
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/settings/bitcoind">
                    BitcoinD
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/settings/password">
                    Change Password
                  </MenuItem>
                </MenuList>
              </Paper>
            ) : (
              <div className={classes.buttonContainer}>
                <RouterLink className={classes.buttonLink} to="/new-contract">
                  <Fab variant="extended" color="primary">
                    <AddIcon />
                    {'New contract'}
                  </Fab>
                </RouterLink>
              </div>
            )}
          </div>
        )}
        <div className={classes.content}>{props.children}</div>
      </div>
    </div>
  )
}

MainLayout.defaultProps = {
  showSidebar: true,
  settingsConfig: false,
}

export default MainLayout
