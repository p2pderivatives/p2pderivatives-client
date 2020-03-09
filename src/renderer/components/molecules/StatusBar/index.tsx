import React, { FC } from 'react'

import { makeStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import AccountCircle from '@material-ui/icons/AccountCircle'

import p2plogo from '../../../assets/p2p-logo.png'

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
  loginButton: {
    color: '#E4E7EF',
  },
})

const StatusBar: FC = () => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const isMenuOpen = Boolean(anchorEl)

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
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
      <MenuItem onClick={handleMenuClose}>Change Password</MenuItem>
      <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
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
            <Button
              className={classes.loginButton}
              variant="text"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              endIcon={<AccountCircle />}
            >
              John Doe
            </Button>
          </Toolbar>
        </AppBar>
      </MuiThemeProvider>
      {renderMenu}
    </div>
  )
}

export default StatusBar
