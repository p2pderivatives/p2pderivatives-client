import React from 'react'
import Button from './'

import { withKnobs, text, boolean, select } from '@storybook/addon-knobs'

export default {
  title: 'Components/Atoms/Button',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

type buttonColorType = 'primary' | 'secondary' | 'inherit' | 'default'
const buttonColorValues: buttonColorType[] = ['primary', 'secondary']

export const button = () => (
  <Button
    variant="contained"
    disabled={boolean('Disabled', false)}
    color={select('Color', buttonColorValues, 'primary')}
  >
    {text('Label', 'Label goes here')}
  </Button>
)

export const outlinedButton = () => (
  <Button
    variant="outlined"
    disabled={boolean('Disabled', false)}
    color={select('Color', buttonColorValues, 'primary')}
  >
    {text('Label', 'Label goes here')}
  </Button>
)
