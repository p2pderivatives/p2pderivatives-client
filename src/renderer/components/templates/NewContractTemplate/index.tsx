import React, { FC, useState, useEffect } from 'react'

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
import OutcomesGrid from '../../organisms/OutcomesGrid'
import UserSelectionDialog from '../../organisms/UserSelectionDialog'
import Outcome from '../../../../common/models/ipc/Outcome'
import { User } from '../../../../common/models/user/User'

type NewContractTemplateProps = {
  tab: number
  onTabChange: (tab: number) => void
  onCSVImport: () => void
  data: Outcome[]
  onCancel: () => void
  users: User[]
}

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

const tabItems: TabItem[] = [{ label: 'General' }, { label: 'Outcomes' }]

const NewContractListTemplate: FC<NewContractTemplateProps> = (
  props: NewContractTemplateProps
) => {
  const classes = useStyles()
  const [tabIndex, setTabIndex] = useState(props.tab)
  const [openAddressBook, setOpenAddressBook] = useState(false)
  const [feeRate, setFeeRate] = useState<number>()

  const oracleDates = [
    DateTime.utc().plus({ days: 1 }),
    DateTime.utc().plus({ days: 2 }),
    DateTime.utc().plus({ days: 3 }),
  ]

  const handleTabChange = (index: number): void => {
    setTabIndex(index)
    props.onTabChange(index)
  }

  useEffect(() => {
    setTabIndex(props.tab)
  }, [props.tab])

  return (
    <div className={classes.rootContainer}>
      <MainLayout>
        <Tabs
          items={tabItems}
          value={tabIndex}
          onTabChange={(idx): void => handleTabChange(idx)}
        />
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
                      onClick={(): void => setOpenAddressBook(true)}
                    >
                      <Contacts />
                    </IconButton>
                  ),
                }}
              ></TextInput>
              <TextInput
                type="number"
                value={feeRate}
                onChange={(event: React.ChangeEvent<{ value: string }>): void =>
                  setFeeRate(parseInt(event.target.value))
                }
                label={'Fee rate'}
              />
              <BitcoinInput label={'Local collateral'} />
              <BitcoinInput label={'Remote collateral'} />
              <FormControl>
                <FormLabel color="secondary">Outcomes</FormLabel>
                <Button
                  style={{ margin: '0.5rem 0rem' }}
                  variant="contained"
                  onClick={(): void => props.onCSVImport()}
                >
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
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={props.onCancel}
                >
                  Cancel
                </Button>
              </div>
            </Grid>
          </div>
        )}
        {tabIndex === 1 && (
          <Box display={tabIndex === 1 ? 'inline' : 'none'}>
            <OutcomesGrid title={'All contracts'} data={props.data} />
          </Box>
        )}
      </MainLayout>
      <UserSelectionDialog
        users={props.users}
        open={openAddressBook}
        onClose={(): void => setOpenAddressBook(false)}
      />
    </div>
  )
}

NewContractListTemplate.defaultProps = {
  tab: 0,
}

export default NewContractListTemplate
