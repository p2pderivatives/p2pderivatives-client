import React, { FC, useState, useEffect } from 'react'

import {
  BitcoinDConfig,
  BitcoinNetwork,
} from '../../../../common/models/ipc/BitcoinDConfig'

import { makeStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import TextInput from '../../atoms/TextInput'
import Button from '../../atoms/Button'

export type WalletSettingsFormProps = {
  checkSettings: (config: BitcoinDConfig) => void
  config?: BitcoinDConfig
}

const useStyles = makeStyles({
  item: {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  buttons: {
    marginTop: '3rem',
    '& > button': {
      marginRight: '1rem',
    },
  },
})

const WalletSettingsForm: FC<WalletSettingsFormProps> = (
  props: WalletSettingsFormProps
) => {
  const classes = useStyles()
  const [ip, setIP] = useState(props.config ? props.config.host : '')
  const [port, setPort] = useState(
    props.config && props.config.port ? props.config.port.toString() : ''
  )
  const [proxy, setProxy] = useState(
    props.config && props.config.sockProxy ? props.config.sockProxy : ''
  )
  const [wallet, setWallet] = useState(props.config ? props.config.wallet : '')
  const [walletPass, setWalletPass] = useState(
    props.config ? props.config.walletPassphrase : ''
  )
  const [rpcUser, setRPCUser] = useState(
    props.config ? props.config.rpcUsername : ''
  )
  const [rpcPassword, setRPCPassword] = useState(
    props.config ? props.config.rpcPassword : ''
  )
  const [network, setNetwork] = useState<BitcoinNetwork>(
    props.config && props.config.network ? props.config.network : 'testnet'
  )
  const [defaultPort, setDefaultPort] = useState('8332')

  const checkSettings = (): void => {
    const tempConfig: BitcoinDConfig = {}
    if (ip) tempConfig.host = ip
    if (port) tempConfig.port = parseInt(port)
    if (proxy) tempConfig.sockProxy = proxy
    if (wallet) tempConfig.wallet = wallet
    if (walletPass) tempConfig.walletPassphrase = walletPass
    if (rpcUser) tempConfig.rpcUsername = rpcUser
    if (rpcPassword) tempConfig.rpcPassword = rpcPassword
    if (network) tempConfig.network = network

    props.checkSettings(tempConfig)
  }

  useEffect(() => {
    if (network === 'testnet') setDefaultPort('18332')
    if (network === 'regtest') setDefaultPort('18443')
  }, [network])

  return (
    <div>
      <Grid
        container
        direction="column"
        justify="space-evenly"
        alignItems="stretch"
      >
        <Grid item xs={12} className={classes.item}>
          <Select
            value={network}
            fullWidth
            onChange={(e): void => setNetwork(e.target.value as BitcoinNetwork)}
          >
            <MenuItem value={'testnet'}>testnet</MenuItem>
            <MenuItem value={'regtest'}>regtest</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <TextInput
            label="IP Address or hostname"
            placeholder="Leave blank for localhost"
            fullWidth
            id="ip"
            name="ip"
            value={ip}
            onChange={(e): void => setIP(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <TextInput
            label="Port"
            type="number"
            placeholder={'Leave blank for default port (' + defaultPort + ')'}
            fullWidth
            id="port"
            name="port"
            value={port}
            onChange={(e): void => setPort(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <TextInput
            label="Socks proxy address to connect through Tor"
            placeholder={'Leave blank for default or if unused.'}
            fullWidth
            id="proxy"
            name="proxy"
            value={proxy}
            onChange={(e): void => setProxy(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <TextInput
            label="RPC Username"
            placeholder="Leave blank if not secured"
            fullWidth
            id="rpcuser"
            name="rpcuser"
            value={rpcUser}
            onChange={(e): void => setRPCUser(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <TextInput
            label="RPC Password"
            placeholder="Leave blank if not secured"
            fullWidth
            id="rpcPassword"
            name="rpcPassword"
            value={rpcPassword}
            onChange={(e): void => setRPCPassword(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <TextInput
            label="Wallet"
            placeholder="Leave blank for default wallet"
            fullWidth
            id="wallet"
            name="wallet"
            value={wallet}
            onChange={(e): void => setWallet(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <TextInput
            label="Wallet Passphrase"
            placeholder="Leave blank if there is no passphrase"
            fullWidth
            id="wallet"
            name="wallet"
            value={walletPass}
            onChange={(e): void => setWalletPass(e.target.value)}
          />
        </Grid>
      </Grid>
      <div className={classes.buttons}>
        <Button variant="outlined" color="primary" onClick={checkSettings}>
          {'Configure'}
        </Button>
      </div>
    </div>
  )
}

export default WalletSettingsForm
