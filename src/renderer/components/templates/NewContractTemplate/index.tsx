import React, { FC, useState } from 'react'

import { DateTime } from 'luxon'
import {
  makeStyles,
  Typography,
  Box,
  Grid,
  IconButton,
  MenuItem,
  FormControl,
  FormLabel,
} from '@material-ui/core'
import Contacts from '@material-ui/icons/Contacts'

import Select from '../../atoms/Select'
import Tabs, { TabItem } from '../../molecules/Tabs'
import MainLayout from '../../organisms/MainLayout'
import TextInput from '../../atoms/TextInput'
import Button from '../../atoms/Button'
import BitcoinInput from '../../atoms/BitcoinInput'
import CETxGrid from '../../organisms/CETxGrid'
import UserSelectionDialog from '../../organisms/UserSelectionDialog'

const useStyles = makeStyles({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#303855',
  },
  content: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'auto',
  },
  titleBorder: {
    width: '12rem',
    borderBottom: '1px solid #B3B6C2',
    margin: '0.5rem 0',
  },
  formGrid: {
    width: '38rem',
    '& > div': {
      marginTop: '1.5rem',
    },
  },
})

const tabItems: TabItem[] = [{ label: 'General' }, { label: 'CETx' }]
const data = [
  {
    fixingPrice: 3000.001,
    partyArec: 0.5,
    partyBrec: 0.0,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.45,
    partyBrec: 0.05,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.4,
    partyBrec: 0.1,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.35,
    partyBrec: 0.15,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.3,
    partyBrec: 0.2,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.25,
    partyBrec: 0.25,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.2,
    partyBrec: 0.3,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.15,
    partyBrec: 0.35,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.1,
    partyBrec: 0.4,
  },
]

const NewContractListTemplate: FC = () => {
  const classes = useStyles()
  const [tabIndex, setTabIndex] = useState(0)
  const [openAddressBook, setOpenAddressBook] = useState(false)

  const oracleDates = [
    DateTime.utc().plus({ days: 1 }),
    DateTime.utc().plus({ days: 2 }),
    DateTime.utc().plus({ days: 3 }),
  ]

  return (
    <div className={classes.rootContainer}>
      <MainLayout>
        <Tabs items={tabItems} onTabChange={idx => setTabIndex(idx)} />
        {tabIndex === 0 && (
          <div className={classes.content}>
            <Typography color="textPrimary" variant="h6">
              {'General term'}
            </Typography>
            <div className={classes.titleBorder}></div>
            <Typography color="textPrimary" variant="caption">
              {'Your work is auto-saved.'}
            </Typography>
            <Grid className={classes.formGrid} container direction="column">
              <TextInput
                label={'Local Party'}
                inputProps={{ readOnly: true }}
                value={'John Doe'}
                helperText={'Read only'}
              ></TextInput>
              <TextInput
                label={'Remote Party'}
                value={'Nice company, Inc'}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      style={{ color: '#67B1F6' }}
                      onClick={() => setOpenAddressBook(true)}
                    >
                      <Contacts />
                    </IconButton>
                  ),
                }}
              ></TextInput>
              <BitcoinInput label={'Local collateral'} />
              <BitcoinInput label={'Remote collateral'} />
              <FormControl>
                <FormLabel color="secondary">Outcomes</FormLabel>
                <Button style={{ margin: '0.5rem 0rem' }} variant="contained">
                  {'CSV File import'}
                </Button>
              </FormControl>
              <FormControl>
                <FormLabel color="secondary">Maturity date</FormLabel>
                <Select>
                  {oracleDates.map(d => (
                    <MenuItem key={d.toMillis()} value={d.toMillis()}>
                      {d.toString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div style={{ marginBottom: '1rem' }}>
                <Button
                  variant="contained"
                  disabled
                  style={{ marginRight: '1rem' }}
                >
                  Publish
                </Button>
                <Button variant="outlined" color="secondary">
                  Cancel
                </Button>
              </div>
            </Grid>
          </div>
        )}
        {tabIndex === 1 && (
          <Box display={tabIndex === 1 ? 'inline' : 'none'}>
            <CETxGrid title={'All contracts'} data={data} />
          </Box>
        )}
      </MainLayout>
      <UserSelectionDialog
        open={openAddressBook}
        onClose={() => setOpenAddressBook(false)}
      />
    </div>
  )
}

export default NewContractListTemplate
