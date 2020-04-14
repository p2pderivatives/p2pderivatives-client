import React, { FC } from 'react'

import ChangePasswordForm, {
  ChangePasswordFormProps,
} from '../../organisms/ChangePasswordForm'

export type ChangePasswordTemplateProps = ChangePasswordFormProps

const ChangePasswordTemplate: FC<ChangePasswordTemplateProps> = (
  props: ChangePasswordTemplateProps
) => {
  return <ChangePasswordForm onSubmit={props.onSubmit} />
}

export default ChangePasswordTemplate
