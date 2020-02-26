import React from 'react'
import Select from './'

import { withKnobs } from '@storybook/addon-knobs'
import { MenuItem } from '@material-ui/core'

import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'

export default {
  title: 'Components/Atoms/Select',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const select = () => {
  let value = 0
  return (
    <MuiThemeProvider theme={theme}>
      <Select value={value} onChange={e => (value = e.target.value as number)}>
        <MenuItem value={0}>Test Value #1</MenuItem>
        <MenuItem value={1}>Test Value #2</MenuItem>
        <MenuItem value={2}>Test Value #3</MenuItem>
      </Select>
    </MuiThemeProvider>
  )
}
