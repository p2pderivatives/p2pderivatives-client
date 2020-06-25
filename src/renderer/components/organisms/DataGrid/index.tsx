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
import numbro from 'numbro'

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

function toCollateralString(collateral: number, addOwn?: boolean): string {
  let collateralString = numbro(collateral).format({ thousandSeparated: true })

  if (addOwn) {
    collateralString += ' (own)'
  }

  return collateralString
}

const DataGrid: FC<DataGridProps> = (props: DataGridProps) => {
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
        customBodyRenderLite: (dataIndex: number): ReactElement => (
          <span>{ContractState[localData[dataIndex].state]}</span>
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
        filter: true,
        // eslint-disable-next-line react/display-name
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
        filter: false,
        sort: true,
        // eslint-disable-next-line react/display-name
        customBodyRenderLite: (dataIndex: number): ReactElement => (
          <span>
            {DateTime.fromMillis(
              localData[dataIndex].maturityTime
            ).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}
          </span>
        ),
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
