import React, { FC } from 'react'
import WalletSettingsForm, {
  WalletSettingsFormProps,
} from '../../organisms/WalletSettingsForm'

type WalletSettingsTemplateProps = WalletSettingsFormProps

const WalletSettingsTemplate: FC<WalletSettingsTemplateProps> = (
  props: WalletSettingsTemplateProps
) => {
  return (
    <WalletSettingsForm
      config={props.config}
      checkSettings={props.checkSettings}
    />
  )
}

export default WalletSettingsTemplate
