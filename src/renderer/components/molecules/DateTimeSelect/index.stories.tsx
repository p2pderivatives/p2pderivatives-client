import React, { ReactElement } from 'react'
import DateTimeSelect from '.'
import StoryRouter from 'storybook-react-router'
import { Container } from '@material-ui/core'
import { MuiThemeProvider } from '@material-ui/core'
import theme from '../../theme'
import { OracleAssetConfiguration } from '../../../../common/oracle/oracle'
import { DateTime, Duration } from 'luxon'
import { action } from '@storybook/addon-actions'
import { date, withKnobs } from '@storybook/addon-knobs'

export default {
  title: 'Components/Molecules/DateTimeSelect',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
  decorators: [StoryRouter(), withKnobs()],
}

const oracleInfo: OracleAssetConfiguration = {
  startDate: DateTime.fromObject({
    year: 2020,
    month: 6,
    day: 10,
    hour: 13,
    minute: 30,
  }),
  range: Duration.fromObject({ years: 2 }),
  frequency: Duration.fromObject({ minute: 5 }),
}

const defaultMinimumDate = new Date('Jun 20 2020')

function DateKnob(): DateTime {
  const timeStamp = date('minimumDate', defaultMinimumDate)
  return DateTime.fromMillis(timeStamp)
}

export const dateTimeSelect2YEvery5M = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="lg">
      <DateTimeSelect
        oracleInfo={oracleInfo}
        onChange={action('onChange')}
        minimumDate={DateKnob()}
      />
    </Container>
  </MuiThemeProvider>
)

const oracleInfo2: OracleAssetConfiguration = {
  startDate: DateTime.utc(),
  range: Duration.fromObject({ years: 2 }),
  frequency: Duration.fromObject({ month: 2 }),
}

export const dateTimeSelect2YREvery2Mo = (): ReactElement => (
  <MuiThemeProvider theme={theme}>
    <Container maxWidth="lg">
      <DateTimeSelect
        oracleInfo={oracleInfo2}
        onChange={action('onChange')}
        minimumDate={DateKnob()}
      />
    </Container>
  </MuiThemeProvider>
)