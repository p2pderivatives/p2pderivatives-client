import React, { useState, FC, ReactElement, useEffect } from 'react'
import MUIDataTable, {
  MUIDataTableProps,
  Responsive,
  SelectableRows,
} from 'mui-datatables'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { Contract } from '../../../../common/models/dlc/Contract'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { DateTime } from 'luxon'

export type DataGridProps = Omit<
  MUIDataTableProps,
  'options' | 'columns' | 'data'
> & {
  data: Contract[]
  onRowClick?: (rowData: string[]) => void
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
    MUIDataTable: {
      paper: {
        height: 'inherit',
      },
      responsiveScrollMaxHeight: {
        maxHeight: 'calc(100% - 116px)',
        height: 'calc(100% - 116px)',
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

type ContractDisplay = Omit<Contract, 'maturityTime'> & {
  maturityTime: string
}

const DataGrid: FC<DataGridProps> = (props: DataGridProps) => {
  // const [fromDate, setFromDate] = useState<Date>()
  // const [toDate, setToDate] = useState<Date>()
  const [localData, setLocalData] = useState<ContractDisplay[]>([])

  useEffect(() => {
    setLocalData(
      props.data.map(x => {
        return {
          ...x,
          maturityTime: DateTime.fromMillis(x.maturityTime).toLocaleString(
            DateTime.DATETIME_FULL_WITH_SECONDS
          ),
        }
      })
    )
  }, [props.data])

  // const handleFromDateChange = (date: Date): void => {
  //   console.log('state from change: ', date)
  //   setFromDate(date)
  //   filterByDate()
  // }

  // const handleToDateChange = (date: Date): void => {
  //   console.log('state to change: ', date)
  //   setToDate(date)
  //   filterByDate()
  // }

  // const filterByDate = (): void => {
  //   localData = props.data.filter((d: unknown): boolean => {
  //     const data = d as DataType
  //     const tradeDate = DateTime.fromISO(data.tradeDate)
  //     const from = fromDate ? DateTime.fromJSDate(fromDate) : null
  //     const to = toDate ? DateTime.fromJSDate(toDate) : null
  //     if (from && to) {
  //       return tradeDate >= from && tradeDate <= to
  //     } else if (from) {
  //       return tradeDate >= from
  //     } else if (to) {
  //       return tradeDate <= to
  //     }
  //     return false
  //   })
  // }

  const options = {
    selectableRows: 'none' as SelectableRows,
    responsive: 'scrollMaxHeight' as Responsive,
    denseTable: false,
    onRowClick: (
      rowData: string[],
      rowMeta: { dataIndex: number; rowIndex: number }
    ): void => {
      if (props.onRowClick) props.onRowClick(rowData)
    },
    // eslint-disable-next-line react/display-name
    // customToolbar: (): ReactElement => {
    //   return (
    //     <Toolbar
    //       fromDate={fromDate}
    //       setFromDate={handleFromDateChange}
    //       toDate={toDate}
    //       setToDate={handleToDateChange}
    //     />
    //   )
    // },
  }

  const columns = [
    {
      name: 'id',
      label: 'Contract ID',
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'state',
      label: 'Status',
      options: {
        filter: false,
        sort: true,
        // eslint-disable-next-line react/display-name
        customBodyRender: (value: ContractState): ReactElement => (
          <span>{ContractState[value]}</span>
        ),
      },
    },
    {
      name: 'counterPartyName',
      label: 'Counter Party',
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: 'localCollateral',
      label: 'Local Collateral',
      options: {
        filter: false,
        sort: true,
        // eslint-disable-next-line react/display-name
        customBodyRender: (value: number): ReactElement => (
          <span>{Math.round(value)}</span>
        ),
      },
    },
    {
      name: 'remoteCollateral',
      label: 'Remote Collateral',
      options: {
        sort: true,
        filter: true,
      },
    },
    {
      name: 'maturityTime',
      label: 'Maturity Time',
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
