import React, { FC, useState, useEffect } from 'react'

import { createMuiTheme, MuiThemeProvider, makeStyles } from '@material-ui/core'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'

import MUIDataTable from 'mui-datatables'

import Button from '../../atoms/Button'

export type UserSelectionDialogProps = {
  open?: boolean
  onClose: () => void
}

const useStyles = makeStyles({
  buttons: {
    marginTop: '3rem',
    '& > button': {
      marginRight: '1rem',
    },
  },
})

const lightTableTheme = createMuiTheme({
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
      default: '#414C81',
      paper: '#414C81',
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
    MuiTableCell: {
      footer: {
        borderBottom: 'none',
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

const columns = [
  {
    name: 'name',
    label: 'Name',
    options: {
      filter: true,
      sort: true,
    },
  },
]
const data = [
  {
    name: 'Nice company, Inc.',
  },
  {
    name: 'Lasagne, Inc.',
  },
]

const options = {
  print: false,
  download: false,
  elevation: 0,
  rowsPerPage: 5,
  response: 'scrollFullHeightFullWidth',
}

const UserSelectionDialog: FC<UserSelectionDialogProps> = (
  props: UserSelectionDialogProps
) => {
  const classes = useStyles()
  const [open, setOpen] = useState(props.open ? props.open : false)

  useEffect(() => {
    if (props.open) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [props.open])

  return (
    <Dialog
      onClose={props.onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <DialogContent dividers>
        <MuiThemeProvider theme={lightTableTheme}>
          <MUIDataTable
            title={'Parties'}
            data={data}
            columns={columns}
            options={options}
          />
        </MuiThemeProvider>
        <div className={classes.buttons}>
          <Button variant="outlined" color="primary">
            {'Add'}
          </Button>
          <Button variant="outlined" color="secondary" onClick={props.onClose}>
            {'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

UserSelectionDialog.defaultProps = {
  open: false,
}

export default UserSelectionDialog
