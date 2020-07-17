import LuxonUtils from '@date-io/luxon'
import { FormControl, FormGroup, FormLabel } from '@material-ui/core'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import { DateTime } from 'luxon'
import MUIDataTable, {
  FilterType,
  MUIDataTableProps,
  Responsive,
  SelectableRows,
} from 'mui-datatables'
import numbro from 'numbro'
import React, { FC, ReactElement, useEffect, useState } from 'react'
import { Contract, ContractState } from '../../../../common/models/dlc/Contract'

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
        overflow: 'auto',
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
    MuiChip: {
      deleteIcon: {
        color: '#3A4473',
        '&:hover': {
          color: '#4A5B83',
        },
      },
    },
  },
})

function toCollateralString(collateral: number, addOwn?: boolean): string {
  let collateralString = numbro(collateral).format({ thousandSeparated: true })

  if (addOwn) {
    collateralString += ' (own)'
  }

  return collateralString
}

const DataGrid: FC<DataGridProps> = (props: DataGridProps) => {
  const [fromDate, setFromDate] = useState<DateTime>()
  const [toDate, setToDate] = useState<DateTime>()
  const [localData, setLocalData] = useState<Contract[]>(props.data)

  useEffect(() => {
    setLocalData(props.data)
  }, [props.data])

  const options = {
    selectableRows: 'none' as SelectableRows,
    responsive: 'vertical' as Responsive,
    denseTable: false,
    onRowClick: (rowData: string[]): void => {
      if (props.onRowClick) {
        props.onRowClick(rowData)
      }
    },
    onFilterChange: (
      changedCol: string,
      filters: unknown[],
      type: FilterType | 'chip' | 'reset'
    ): void => {
      if (type === 'reset') {
        setFromDate(undefined)
        setToDate(undefined)
      }
    },
  }

  const stateToString = (value: string): string =>
    ContractState[parseInt(value)]

  const columns = [
    {
      name: 'id',
      label: 'Contract ID',
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: 'state',
      label: 'Status',
      options: {
        filter: true,
        sort: true,
        filterType: 'checkbox' as FilterType,
        filterOptions: {
          renderValue: stateToString,
        },
        customFilterListOptions: {
          render: stateToString,
        },
        customBodyRender: (value: ContractState): ReactElement => (
          <span>{ContractState[value]}</span>
        ),
      },
    },
    {
      name: 'counterPartyName',
      label: 'Counter Party',
      options: {
        filter: true,
        sort: true,
        filterType: 'checkbox' as FilterType,
      },
    },
    {
      name: 'localCollateral',
      label: 'Local Collateral',
      options: {
        filter: false,
        sort: true,
        customBodyRenderLite: (dataIndex: number): ReactElement => {
          const contract = localData[dataIndex]
          return (
            <span>
              {toCollateralString(
                contract.localCollateral,
                contract.isLocalParty
              )}
            </span>
          )
        },
      },
    },
    {
      name: 'remoteCollateral',
      label: 'Remote Collateral',
      options: {
        sort: true,
        filter: false,
        customBodyRenderLite: (dataIndex: number): ReactElement => {
          const contract = localData[dataIndex]
          return (
            <span>
              {toCollateralString(
                contract.remoteCollateral,
                !contract.isLocalParty
              )}
            </span>
          )
        },
      },
    },
    {
      name: 'maturityTime',
      label: 'Maturity Time',
      options: {
        filter: true,
        filterType: 'custom' as FilterType,
        sort: true,
        customBodyRenderLite: (dataIndex: number): ReactElement => (
          <span>
            {DateTime.fromMillis(
              localData[dataIndex].maturityTime
            ).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}
          </span>
        ),
        filterOptions: {
          fullWidth: true,
          names: [],
          logic: (dateString: string): boolean => {
            const date = parseInt(dateString)
            let filter = false
            if (fromDate && toDate) {
              filter = fromDate.toMillis() > date || toDate.toMillis() < date
            } else if (fromDate) {
              filter = fromDate.toMillis() > date
            } else if (toDate) {
              filter = toDate.toMillis() < date
            }
            return filter
          },
          display: (): ReactElement => (
            <FormControl>
              <FormLabel>Maturity Date</FormLabel>
              <FormGroup row>
                <DateTimePicker
                  label="From"
                  value={fromDate || null}
                  onChange={(date: MaterialUiPickersDate): void => {
                    setFromDate(date as DateTime)
                  }}
                  style={{ width: '45%', marginRight: '5%' }}
                />
                <DateTimePicker
                  label="To"
                  value={toDate || null}
                  onChange={(date: MaterialUiPickersDate): void => {
                    setToDate(date as DateTime)
                  }}
                  style={{ width: '45%', marginRight: '5%' }}
                />
              </FormGroup>
            </FormControl>
          ),
        },
      },
    },
  ]

  return (
    <MuiThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <MUIDataTable
          title={props.title}
          data={localData}
          columns={columns}
          options={options}
        />
      </MuiPickersUtilsProvider>
    </MuiThemeProvider>
  )
}

export default DataGrid
