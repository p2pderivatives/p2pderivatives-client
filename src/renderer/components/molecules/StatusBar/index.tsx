import React, { FC } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import {
  makeStyles,
  createMuiTheme,
  MuiThemeProvider,
  IconButton,
} from '@material-ui/core'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Refresh from '@material-ui/icons/Refresh'

import p2plogo from '../../../assets/p2p-logo.png'
import BtcDisplay from '../../atoms/BtcDisplay'
import { logoutRequest } from '../../../store/login/actions'
import { useDispatch } from 'react-redux'
import { push } from 'connected-react-router'

type StatusBarProps = {
  username: string
  balance: number
  refresh: () => void
}

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#69F8C4',
      main: '#303855',
      dark: '#09E998',
    },
    secondary: {
      light: '#FFFFFF',
      main: '#E4E7EF',
      dark: '#B3B6C2',
    },
  },
})

const useStyles = makeStyles({
  appLogoContainer: {
    flex: 1,
  },
  appLogo: {
    height: '40px',
    margin: '12px 0',
  },
  balanceSection: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '0.5rem',
  },
  loginButton: {
    color: '#E4E7EF',
  },
  menuLink: {
    color: 'inherit',
  },
})

const StatusBar: FC<StatusBarProps> = (props: StatusBarProps) => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const isMenuOpen = Boolean(anchorEl)

  const dispatch = useDispatch()

  const handleProfileMenuOpen = (
    event: React.MouseEvent<HTMLElement>
  ): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (): void => {
    setAnchorEl(null)
  }

  const handleLogout = (): void => {
    handleMenuClose()
    dispatch(logoutRequest())
    dispatch(push('/'))
  }

  const menuId = 'primary-search-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      getContentAnchorEl={null}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem
        onClick={handleMenuClose}
        component={RouterLink}
        to="/settings/bitcoind"
      >
        BitcoinD Settings
      </MenuItem>
      <MenuItem
        component={RouterLink}
        to="/settings/password"
        onClick={handleMenuClose}
      >
        Change Password
      </MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  )

  return (
    <div>
      <MuiThemeProvider theme={theme}>
        <AppBar position="relative">
          <Toolbar>
            <div className={classes.appLogoContainer}>
              <img
                className={classes.appLogo}
                src={p2plogo}
                alt="P2P-Derivatives"
              />
            </div>
            <div className={classes.balanceSection}>
              <IconButton color="secondary" onClick={props.refresh}>
                <Refresh />
              </IconButton>
              <BtcDisplay satValue={props.balance} currency="BTC" />
            </div>
            <Button
              className={classes.loginButton}
              variant="text"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              endIcon={<AccountCircle />}
            >
              {props.username}
            </Button>
          </Toolbar>
        </AppBar>
      </MuiThemeProvider>
      {renderMenu}
    </div>
  )
}

export default StatusBar
