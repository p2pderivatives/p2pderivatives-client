import React, { useState, FC, ReactElement } from 'react'
import { DateTime } from 'luxon'
import MUIDataTable, { MUIDataTableProps, Responsive } from 'mui-datatables'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import Toolbar from './DatePickerToolbar'

export type DataGridProps = Omit<MUIDataTableProps, 'options' | 'columns'>

interface DataType {
  contractId: string
  product: string
  status: string
  sendAddress: string
  tradeDate: string
  expirationDate: string
}

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#E4E7EF',
      main: '#E4E7EF',
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

  const handleFromDateChange = (date: Date): void => {
    setFromDate(date)
    filterByDate()
  }

  const handleToDateChange = (date: Date): void => {
    setToDate(date)
    filterByDate()
  }

  const filterByDate = (): void => {
    localData = props.data.filter((d: unknown): boolean => {
      const data = d as DataType
      const tradeDate = DateTime.fromISO(data.tradeDate)
      const from = fromDate ? DateTime.fromJSDate(fromDate) : null
      const to = toDate ? DateTime.fromJSDate(toDate) : null
      if (from && to) {
        return tradeDate >= from && tradeDate <= to
      } else if (from) {
        return tradeDate >= from
      } else if (to) {
        return tradeDate <= to
      }
      return false
    })
  }

  const options = {
    selectableRowsOnClick: true,
    responsive: 'scrollMaxHeight' as Responsive,
    // eslint-disable-next-line react/display-name
    customToolbar: (): ReactElement => {
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
