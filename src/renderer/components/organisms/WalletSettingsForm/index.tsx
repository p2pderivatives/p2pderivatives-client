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
    props.config && props.config.network ? props.config.network : 'mainnet'
  )
  const [defaultPort, setDefaultPort] = useState('8332')

  const checkSettings = () => {
    const tempConfig: BitcoinDConfig = {}
    if (ip) tempConfig.host = ip
    if (port) tempConfig.port = parseInt(port)
    if (wallet) tempConfig.wallet = wallet
    if (walletPass) tempConfig.walletPassphrase = walletPass
    if (rpcUser) tempConfig.rpcUsername = rpcUser
    if (rpcPassword) tempConfig.rpcPassword = rpcPassword
    if (network) tempConfig.network = network

    props.checkSettings(tempConfig)
  }

  useEffect(() => {
    if (network === 'mainnet') setDefaultPort('8332')
    if (network === 'testnet') setDefaultPort('18332')
    if (network === 'regtest') setDefaultPort('18443')
  }, [network])

  return (
    <div>
      <Grid container spacing={5} direction="column" xl>
        <Grid item xs={12}>
          <Select
            value={network}
            fullWidth
            onChange={e => setNetwork(e.target.value as BitcoinNetwork)}
          >
            <MenuItem value={'mainnet'}>mainnet</MenuItem>
            <MenuItem value={'testnet'}>testnet</MenuItem>
            <MenuItem value={'regtest'}>regtest</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12}>
          <TextInput
            label="IP Address"
            placeholder="Leave blank for localhost"
            fullWidth
            id="ip"
            name="ip"
            value={ip}
            onChange={e => setIP(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextInput
            label="Port"
            type="number"
            placeholder={'Leave blank for default port (' + defaultPort + ')'}
            fullWidth
            id="port"
            name="port"
            value={port}
            onChange={e => setPort(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextInput
            label="RPC Username"
            placeholder="Leave blank if not secured"
            fullWidth
            id="rpcuser"
            name="rpcuser"
            value={rpcUser}
            onChange={e => setRPCUser(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextInput
            label="RPC Password"
            placeholder="Leave blank if not secured"
            fullWidth
            id="rpcPassword"
            name="rpcPassword"
            value={rpcPassword}
            onChange={e => setRPCPassword(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextInput
            label="Wallet"
            placeholder="Leave blank for default wallet"
            fullWidth
            id="wallet"
            name="wallet"
            value={wallet}
            onChange={e => setWallet(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextInput
            label="Wallet Passphrase"
            placeholder="Leave blank if there is no passphrase"
            fullWidth
            id="wallet"
            name="wallet"
            value={walletPass}
            onChange={e => setWalletPass(e.target.value)}
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
