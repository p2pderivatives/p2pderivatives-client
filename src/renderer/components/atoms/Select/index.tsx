import React, { FC } from 'react'
import MuiSelect, {
  SelectProps as MuiSelectProps,
} from '@material-ui/core/Select'

export type SelectProps = MuiSelectProps

const Select: FC<SelectProps> = (props: SelectProps) => <MuiSelect {...props} />

export default Select
