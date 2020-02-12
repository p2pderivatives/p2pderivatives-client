import React, { useState, FC } from 'react'
import MUIDataTable, { MUIDataTableProps } from 'mui-datatables'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import Toolbar from './DatePickerToolbar'

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

const DataGrid: FC<DataGridProps> = (props: DataGridProps) => {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  let localData = props.data

  const handleFromDateChange = (date: Date) => {
    console.log('state from change: ', date)
    setFromDate(date)
    filterByDate()
  }

  const handleToDateChange = (date: Date) => {
    console.log('state to change: ', date)
    setToDate(date)
    filterByDate()
  }

  const filterByDate = () => {
    localData = props.data.filter((d: any) => {
      if (fromDate && toDate) {
        return d.tradeDate >= fromDate && d.tradeDate <= toDate
      } else if (fromDate) {
        return d.tradeDate >= fromDate
      } else if (toDate) {
        return d.tradeDate <= toDate
      }
    })
  }

  const options = {
    selectableRowsOnClick: true,
    responsive: 'scrollMaxHeight',
    // eslint-disable-next-line react/display-name
    customToolbar: () => {
      return (
        <Toolbar
          fromDate={fromDate}
          setFromDate={handleFromDateChange}
          toDate={toDate}
          setToDate={handleToDateChange}
        />
      )
    },
  }

  const columns = [
    {
      name: 'contractId',
      label: 'Contract ID',
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'product',
      label: 'Product',
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: 'status',
      label: 'Status',
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: 'sendAddress',
      label: 'Send Address',
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: 'tradeDate',
      label: 'Trade Date',
      options: {
        sort: true,
        filter: true,
      },
    },
    {
      name: 'expirationDate',
      label: 'Expiration Date',
      options: {
        filter: false,
        sort: true,
      },
    },
  ]

  return (
    <MuiThemeProvider theme={theme}>
      <MUIDataTable
        title={props.title}
        data={localData}
        columns={columns}
        options={options}
      />
    </MuiThemeProvider>
  )
}

export default DataGrid
