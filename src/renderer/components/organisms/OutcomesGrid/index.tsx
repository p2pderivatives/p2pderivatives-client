import React, { FC } from 'react'
import MUIDataTable, { MUIDataTableProps } from 'mui-datatables'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

export type DataGridProps = Omit<MUIDataTableProps, 'options' | 'columns'>

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

const OutcomesGrid: FC<DataGridProps> = (props: DataGridProps) => {
  const columns = [
    {
      name: 'fixingPrice',
      label: 'Fixing price',
      options: {
        sort: true,
      },
    },
    {
      name: 'aReward',
      label: 'Party A receive (BTC)',
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'bReward',
      label: 'Party B receive (BTC)',
      options: {
        filter: true,
        sort: true,
      },
    },
  ]

  return (
    <MuiThemeProvider theme={theme}>
      <MUIDataTable title={props.title} data={props.data} columns={columns} />
    </MuiThemeProvider>
  )
}

export default OutcomesGrid
