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
import { User } from '../../../../common/models/user/User'
import {
  ContractSimple,
  OutcomeSimple,
} from '../../../../common/models/ipc/ContractSimple'
import { ContractState } from '../../../../common/models/dlc/ContractState'

type NewContractTemplateProps = {
  tab: number
  onTabChange: (tab: number) => void
  onCSVImport: () => void
  data: OutcomeSimple[]
  onCancel: () => void
  onPublish: (contract: ContractSimple) => void
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
  const [remoteParty, setRemoteParty] = useState('')
  const [localCollateral, setLocalCollateral] = useState(0)
  const [remoteCollateral, setRemoteCollateral] = useState(0)
  const [feeRate, setFeeRate] = useState(0)
  const [maturityDate, setMaturityDate] = useState(0)

  const oracleDates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x, i) => {
    const date = DateTime.utc()
      .plus({ minutes: i })
      .set({ second: 0, millisecond: 0 })
    console.log(date.toMillis())
    return date
  })

  const handleTabChange = (index: number): void => {
    setTabIndex(index)
    props.onTabChange(index)
  }

  const handleUserSelect = (username: string): void => {
    setRemoteParty(username)
    setOpenAddressBook(false)
  }

  const handleMaturityChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ): void => {
    setMaturityDate(event.target.value as number)
  }

  const handlePublish = (): void => {
    const contract: ContractSimple = {
      counterPartyName: remoteParty,
      feeRate: feeRate,
      localCollateral: localCollateral,
      remoteCollateral: remoteCollateral,
      outcomes: props.data,
      state: ContractState.Initial,
      id: '',
      maturityTime: DateTime.fromMillis(maturityDate).toISODate(),
    }
    props.onPublish(contract)
  }

  console.log('HOHO')
  console.log(maturityDate)

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
                label={'Remote Party'}
                value={remoteParty}
                InputProps={{
                  readOnly: true,
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
              <BitcoinInput
                value={feeRate}
                onChange={(value: number): void => setFeeRate(value)}
                label={'Fee rate'}
              />
              <BitcoinInput
                value={localCollateral}
                onChange={(value: number): void => setLocalCollateral(value)}
                label={'Local collateral'}
              />
              <BitcoinInput
                value={remoteCollateral}
                onChange={(value: number): void => setRemoteCollateral(value)}
                label={'Remote collateral'}
              />
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
                <Select value={maturityDate} onChange={handleMaturityChange}>
                  {oracleDates.map((d, i) => (
                    <MenuItem key={i} value={d.toMillis()}>
                      {d.toString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div style={{ marginBottom: '1rem' }}>
                <Button
                  variant="contained"
                  style={{ marginRight: '1rem' }}
                  onClick={handlePublish}
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
        onSelect={handleUserSelect}
      />
    </div>
  )
}

NewContractListTemplate.defaultProps = {
  tab: 0,
}

export default NewContractListTemplate
