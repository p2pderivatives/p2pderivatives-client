import React, { FC } from 'react'

import WalletSettingsForm, {
  WalletSettingsFormProps,
} from '../../organisms/WalletSettingsForm'

type WalletSettingsTemplateProps = WalletSettingsFormProps

const WalletSettingsTemplate: FC<WalletSettingsTemplateProps> = (
  props: WalletSettingsTemplateProps
) => {
  return (
    <div>
      <WalletSettingsForm
        config={props.config}
        checkSettings={props.checkSettings}
      />
    </div>
  )
}

export default WalletSettingsTemplate
