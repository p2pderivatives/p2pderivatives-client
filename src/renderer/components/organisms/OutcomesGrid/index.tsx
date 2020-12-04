import React, { FC, ReactElement, useState, useEffect } from 'react'
import MUIDataTable, { MUIDataTableProps } from 'mui-datatables'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import BtcDisplay from '../../atoms/BtcDisplay'
import {
  isEnumerationOutcome,
  Outcome,
} from '../../../../common/models/dlc/Outcome'

export type DataGridProps = Omit<
  MUIDataTableProps,
  'options' | 'columns' | 'data'
> & {
  data: ReadonlyArray<Outcome>
}

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#E4E7EF',
      main: '#E4E7EF', // '#3AF3B1',
      dark: '#E4E7EF',
    },
    secondary: {
      light: '#FFFFFF',
      main: '#E4E7EF',
      dark: '#B3B6C2',
    },
    background: {
      default: '#3A4473',
      paper: '#3A4473',
    },
    text: {
      primary: '#E4E7EF',
      secondary: '#A2A6B4',
    },
    action: {
      active: '#E4E7EF',
    },
  },
  overrides: {
    MuiInput: {
      underline: {
        '&:before': {
          borderBottomColor: '#E4E7EF',
        },
      },
    },
    MuiTableRow: {
      root: {
        '&$selected': {
          backgroundColor: 'rgb(255, 255, 255, 0.05)',
        },
        '&$hover:hover': {
          backgroundColor: 'rgb(255, 255, 255, 0.1)',
        },
      },
    },
    MUIDataTableSelectCell: {
      root: {
        display: 'none',
      },
    },
    MUIDataTableToolbar: {
      actions: {
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'flex-end',
      },
    },
  },
})

interface DisplayOutcome {
  outcome: string
  local: number
  remote: number
}

const parseOutcomes = (data: ReadonlyArray<Outcome>): DisplayOutcome[] => {
  const len = data.length
  return data.map((x, i) => parseOutcome(x, i, len - 1))
}

const parseOutcome = (
  data: Outcome,
  index: number,
  lastIndex: number
): DisplayOutcome => {
  if (isEnumerationOutcome(data)) {
    return {
      outcome: data.outcome,
      local: data.payout.local,
      remote: data.payout.remote,
    }
  }

  const start = index === 0 ? 0 : data.start
  const outcome =
    index === lastIndex
      ? `${start}+`
      : `${start}-${data.start + data.count - 1}`
  return {
    outcome,
    local: data.payout.local,
    remote: data.payout.remote,
  }
}

const OutcomesGrid: FC<DataGridProps> = (props: DataGridProps) => {
  const [data, setData] = useState(parseOutcomes(props.data))

  useEffect(() => {
    const parsedData = parseOutcomes(props.data)
    setData(parsedData)
  }, [setData, props.data])

  const columns = [
    {
      name: 'outcome',
      label: 'Fixing price',
      options: {
        sort: true,
      },
    },
    {
      name: 'local',
      label: 'Local party receives',
      options: {
        filter: true,
        sort: true,
        // eslint-disable-next-line react/display-name
        customBodyRenderLite: (dataIndex: number): ReactElement => (
          <BtcDisplay
            variant="inherit"
            satValue={data[dataIndex].local}
            currency="BTC"
          />
        ),
      },
    },
    {
      name: 'remote',
      label: 'Remote party receives',
      options: {
        filter: true,
        sort: true,
        // eslint-disable-next-line react/display-name
        customBodyRenderLite: (dataIndex: number): ReactElement => (
          <BtcDisplay
            variant="inherit"
            satValue={data[dataIndex].remote}
            currency="BTC"
          />
        ),
      },
    },
  ]

  return (
    <MuiThemeProvider theme={theme}>
      <MUIDataTable title={props.title} data={[...data]} columns={columns} />
    </MuiThemeProvider>
  )
}

export default OutcomesGrid
