import React, { FC } from 'react'

import { makeStyles, Typography } from '@material-ui/core'

import MainLayout from '../../organisms/MainLayout'
import WalletSettingsForm, {
  WalletSettingsFormProps,
} from '../../organisms/WalletSettingsForm'

type WalletSettingsTemplateProps = WalletSettingsFormProps & {
  onBack: () => void
}

const useStyles = makeStyles({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#303855',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  contentDiv: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginTop: '1.5rem',
    paddingBottom: '1.5rem',
  },
})

const WalletSettingsTemplate: FC<WalletSettingsTemplateProps> = (
  props: WalletSettingsTemplateProps
) => {
  const classes = useStyles()

  return (
    <div className={classes.rootContainer}>
      <MainLayout onBack={props.onBack} settingsConfig={true}>
        <div className={classes.contentDiv}>
          <Typography
            color="textPrimary"
            component="h2"
            style={{ marginBottom: '1.5rem' }}
          >
            {'BitcoinD Settings'}
          </Typography>
          <WalletSettingsForm
            config={props.config}
            checkSettings={props.checkSettings}
          />
        </div>
      </MainLayout>
    </div>
  )
}

export default WalletSettingsTemplate
