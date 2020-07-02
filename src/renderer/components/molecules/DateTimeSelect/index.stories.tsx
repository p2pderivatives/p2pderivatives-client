import React, { ReactElement } from 'react'
import DateTimeSelect from '.'
import StoryRouter from 'storybook-react-router'
import { Container } from '@material-ui/core'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { OracleAssetConfiguration } from '../../../../common/oracle/oracle'
import { DateTime, Duration, DurationObject } from 'luxon'
import { action } from '@storybook/addon-actions'
import { date, withKnobs, select, number } from '@storybook/addon-knobs'

export default {
  title: 'Components/Molecules/DateTimeSelect',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
  decorators: [StoryRouter(), withKnobs()],
}

const defaultMinimumDate = new Date('Jun 20 2020')

function dateKnob(name: string): DateTime {
  const timeStamp = date(name, defaultMinimumDate)
  return DateTime.fromMillis(timeStamp)
}

function durationKnob(name: string): Duration {
  const period: 'years' | 'months' | 'days' | 'hours' | 'minutes' = select(
    name + ' period',
    {
      years: 'years',
      months: 'months',
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
    },
    'years'
  )

  const value: number = number(name + ' duration', 1, {
    range: true,
    min: 1,
    max: 100,
    step: 1,
  })

  const obj: DurationObject = {}
  obj[period] = value

  return Duration.fromObject(obj)
}

function oracleInfo(): OracleAssetConfiguration {
  const startDate = dateKnob('start date')
  const range = durationKnob('range')
  const frequency = durationKnob('frequency')

  return {
    startDate,
    range,
    frequency,
  }
}

export const dateTimeSelect = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="lg">
      <DateTimeSelect
        oracleInfo={oracleInfo()}
        onChange={action('onChange')}
        minimumDate={dateKnob('minimumDate')}
      />
    </Container>
  </MuiThemeProvider>
)
