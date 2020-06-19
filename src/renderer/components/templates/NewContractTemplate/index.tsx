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
  FormHelperText,
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
import { Contract } from '../../../../common/models/dlc/Contract'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { Outcome } from '../../../../common/models/dlc/Outcome'

type NewContractTemplateProps = {
  tab: number
  onTabChange: (tab: number) => void
  onCSVImport: () => void
  data: Outcome[]
  onCancel: () => void
  onPublish: (contract: Contract) => void
  users: User[]
  contract?: Contract
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

const blankContract: Contract = {
  state: ContractState.Initial,
  localCollateral: 0,
  remoteCollateral: 0,
  feeRate: 0,
  outcomes: [],
  maturityTime: 0,
  counterPartyName: '',
}

function validationBase(
  isValid: boolean,
  setError: (e: boolean) => void,
  setMessage: (m: string) => void,
  message: string
): boolean {
  if (!isValid) {
    setError(true)
    setMessage(message)
    return false
  }

  setError(false)
  setMessage('')
  return true
}

const NewContractListTemplate: FC<NewContractTemplateProps> = (
  props: NewContractTemplateProps
) => {
  const contract = props.contract ? props.contract : blankContract
  const classes = useStyles()
  const [tabIndex, setTabIndex] = useState(props.tab)
  const [openAddressBook, setOpenAddressBook] = useState(false)
  const [remoteParty, setRemoteParty] = useState(contract.counterPartyName)
  const [localCollateral, setLocalCollateral] = useState({
    value: contract.localCollateral,
    isBitcoin: false,
  })
  const [remoteCollateral, setRemoteCollateral] = useState({
    value: contract.remoteCollateral,
    isBitcoin: false,
  })
  const [feeRate, setFeeRate] = useState(contract.feeRate)
  const [maturityDate, setMaturityDate] = useState(contract.maturityTime)

  const [feeRateError, setFeeRateError] = useState(false)
  const [feeRateMessage, setFeeRateMessage] = useState('')

  const [localCollateralError, setLocalCollateralError] = useState(false)
  const [localCollateralMessage, setLocalCollateralMessage] = useState('')

  const [remoteCollateralError, setRemoteCollateralError] = useState(false)
  const [remoteCollateralMessage, setRemoteCollateralMessage] = useState('')

  const [remotePartyError, setRemotePartyError] = useState(false)
  const [remotePartyMessage, setRemotePartyMessage] = useState('')

  const [outcomesError, setOutcomesError] = useState(false)
  const [outcomesMessage, setOutcomesMessage] = useState('')

  const [maturityError, setMaturityError] = useState(false)
  const [maturityMessage, setMaturityMessage] = useState('')

  const validateFeeRate: (feeRateVal?: number) => boolean = (
    feeRateVal: number = feeRate
  ) => {
    const isValid = Number.isInteger(feeRateVal) && feeRateVal > 0
    return validationBase(
      isValid,
      setFeeRateError,
      setFeeRateMessage,
      'Must be an integer number greater than zero'
    )
  }

  const validateRemoteParty: (remotePartyVal?: string) => boolean = (
    remotePartyVal: string = remoteParty
  ) => {
    return validationBase(
      remotePartyVal !== '',
      setRemotePartyError,
      setRemotePartyMessage,
      'Must select a counter party'
    )
  }

  const validateCollaterals: (
    localCollateralValue?: number,
    remoteCollateralValue?: number
  ) => boolean = (
    localCollateralValue: number = localCollateral.value,
    remoteCollateralValue: number = remoteCollateral.value
  ) => {
    console.log(localCollateralValue)
    let isValid = localCollateralValue !== 0 || remoteCollateralValue !== 0
    const message = 'One collateral needs to be non zero'
    validationBase(
      isValid,
      setLocalCollateralError,
      setLocalCollateralMessage,
      message
    )
    validationBase(
      isValid,
      setRemoteCollateralError,
      setRemoteCollateralMessage,
      message
    )
    const nanMessage = 'Please input a number'
    isValid =
      isValid &&
      validationBase(
        !isNaN(localCollateralValue),
        setLocalCollateralError,
        setLocalCollateralMessage,
        nanMessage
      )
    isValid =
      isValid &&
      validationBase(
        !isNaN(remoteCollateralValue),
        setRemoteCollateralError,
        setRemoteCollateralMessage,
        nanMessage
      )
    return isValid
  }

  const validateOutcomes: (outcomes?: Outcome[]) => boolean = (
    outcomes: Outcome[] = props.data
  ) => {
    return validationBase(
      outcomes.length > 0,
      setOutcomesError,
      setOutcomesMessage,
      'Needs at least one outcome'
    )
  }

  const validateMaturity: (maturity?: number) => boolean = (
    maturity: number = maturityDate
  ) => {
    return validationBase(
      maturity > 0,
      setMaturityError,
      setMaturityMessage,
      'Please select a maturity date'
    )
  }

  if (outcomesError && props.data.length > 0) {
    validateOutcomes()
  }

  const validate: () => boolean = () => {
    const validations: (() => boolean)[] = [
      validateFeeRate,
      validateRemoteParty,
      validateCollaterals,
      validateOutcomes,
      validateMaturity,
    ]

    return validations.map(x => x()).reduce((acc, cur) => acc && cur)
  }

  const oracleDates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x, i) => {
    const date = DateTime.utc()
      .plus({ minutes: i })
      .set({ second: 0, millisecond: 0 })
    return date
  })

  const handleTabChange = (index: number): void => {
    setTabIndex(index)
    props.onTabChange(index)
  }

  const handleUserSelect = (username: string): void => {
    setRemoteParty(username)
    validateRemoteParty(username)
    setOpenAddressBook(false)
  }

  const handleMaturityChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ): void => {
    setMaturityDate(event.target.value as number)
  }

  const handlePublish = (): void => {
    if (!validate()) {
      return
    }
    const localCol = localCollateral.isBitcoin
      ? localCollateral.value * 100000000
      : localCollateral.value
    const remoteCol = remoteCollateral.isBitcoin
      ? remoteCollateral.value * 100000000
      : remoteCollateral.value
    const publishContract: Contract = {
      id: contract.id,
      counterPartyName: remoteParty,
      feeRate: feeRate,
      localCollateral: localCol,
      remoteCollateral: remoteCol,
      outcomes: props.data,
      state: ContractState.Initial,
      maturityTime: maturityDate,
    }
    props.onPublish(publishContract)
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
            <Grid className={classes.formGrid} container direction="column">
              <TextInput
                label={'Remote Party'}
                value={remoteParty}
                error={remotePartyError}
                helperText={remotePartyMessage}
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
              <TextInput
                type="number"
                value={feeRate}
                error={feeRateError}
                helperText={feeRateMessage}
                onKeyPress={(event: React.KeyboardEvent): void => {
                  if (event.key === '.' || event.key === 'e') {
                    event.preventDefault()
                  }
                }}
                onChange={(
                  event: React.ChangeEvent<{ value: string }>
                ): void => {
                  const value = parseInt(event.target.value)
                  setFeeRate(value)
                  validateFeeRate(value)
                }}
                label={'Fee rate'}
              />
              <BitcoinInput
                value={localCollateral.value}
                error={localCollateralError}
                helperText={localCollateralMessage}
                isBitcoin={localCollateral.isBitcoin}
                onCoinChange={(isBitcoin: boolean): void => {
                  const collat = localCollateral
                  collat.isBitcoin = isBitcoin
                  setLocalCollateral(collat)
                }}
                onChange={(value: number, isBitcoin: boolean): void => {
                  setLocalCollateral({ value, isBitcoin })
                  validateCollaterals(value)
                }}
                label={'Local collateral'}
              />
              <BitcoinInput
                value={remoteCollateral.value}
                isBitcoin={remoteCollateral.isBitcoin}
                error={remoteCollateralError}
                helperText={remoteCollateralMessage}
                onCoinChange={(isBitcoin: boolean): void => {
                  const collat = localCollateral
                  collat.isBitcoin = isBitcoin
                  setRemoteCollateral(collat)
                }}
                onChange={(value: number, isBitcoin: boolean): void => {
                  setRemoteCollateral({ value, isBitcoin })
                  validateCollaterals(localCollateral.value, value)
                }}
                label={'Remote collateral'}
              />
              <FormControl>
                <FormLabel error={outcomesError} color="secondary">
                  Outcomes
                </FormLabel>
                <Button
                  style={{ margin: '0.5rem 0rem' }}
                  variant="contained"
                  onClick={(): void => props.onCSVImport()}
                >
                  {'CSV File import'}
                </Button>
                {outcomesError && (
                  <FormHelperText error>{outcomesMessage}</FormHelperText>
                )}
              </FormControl>
              <FormControl>
                <FormLabel error={maturityError} color="secondary">
                  Maturity date
                </FormLabel>
                <Select
                  value={maturityDate}
                  onChange={value => {
                    handleMaturityChange(value)
                    validateMaturity(value.target.value as number)
                  }}
                >
                  {oracleDates.map((d, i) => (
                    <MenuItem key={i} value={d.toMillis()}>
                      {d.toString()}
                    </MenuItem>
                  ))}
                </Select>
                {maturityError && (
                  <FormHelperText error>{maturityMessage}</FormHelperText>
                )}
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
