import React from 'react'
import Fab from './'
import AddIcon from '@material-ui/icons/Add'

import { withKnobs, text, boolean, select } from '@storybook/addon-knobs'

export default {
  title: 'Components/Atoms/Fab',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

type buttonColorType = 'primary' | 'secondary' | 'inherit' | 'default'
const buttonColorValues: buttonColorType[] = ['primary', 'secondary']

export const fab = () => (
  <Fab
    variant="extended"
    disabled={boolean('Disabled', false)}
    color={select('Color', buttonColorValues, 'primary')}
  >
    <AddIcon />
    {text('Label', 'New contract')}
  </Fab>
)

export const justTextFab = () => (
  <Fab
    variant="extended"
    disabled={boolean('Disabled', false)}
    color={select('Color', buttonColorValues, 'primary')}
  >
    {text('Label', 'New contract')}
  </Fab>
)
