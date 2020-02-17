import React from 'react'
import TextInput from './'

import { withKnobs, text, boolean, color } from '@storybook/addon-knobs'

export default {
  title: 'Components/Atoms/TextInput',
  decorators: [withKnobs],
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

export const textInput = () => (
  <TextInput
    label={text('Label', 'Label goes here')}
    disabled={boolean('Disabled', false)}
    foreground={color('Input text color', 'white')}
    color={color('Default color', '#A2A6B4')}
    hoverColor={color('Hover color', 'white')}
    focusColor={color('Focus color', 'white')}
    helperText={text('Helper text', 'Some help')}
  />
)
