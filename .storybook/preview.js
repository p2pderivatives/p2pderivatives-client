import { addDecorator } from '@storybook/react'
import { withUserProvider } from './decorators'

addDecorator(withUserProvider)
