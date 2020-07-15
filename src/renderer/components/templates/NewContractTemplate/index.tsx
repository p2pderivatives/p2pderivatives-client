import React, { FC, useState, useEffect } from 'react'

import { DateTime } from 'luxon'
import {
  makeStyles,
  Typography,
  Box,
  Grid,
  IconButton,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@material-ui/core'
import Contacts from '@material-ui/icons/Contacts'

import Tabs, { TabItem } from '../../molecules/Tabs'
import MainLayout from '../../organisms/MainLayout'
import TextInput from '../../atoms/TextInput'
import Button from '../../atoms/Button'
import BitcoinInput from '../../atoms/BitcoinInput'
import OutcomesGrid from '../../organisms/OutcomesGrid'
import UserSelectionDialog from '../../organisms/UserSelectionDialog'
import { User } from '../../../../common/models/user/User'
import DateTimeSelect from '../../molecules/DateTimeSelect'
import { OracleAssetConfiguration } from '../../../../common/oracle/oracle'
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
  oracleInfo?: OracleAssetConfiguration
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
    isBitcoin: true,
  })
  const [remoteCollateral, setRemoteCollateral] = useState({
    value: contract.remoteCollateral,
    isBitcoin: true,
  })
  const [optionPremium, setOptionPremium] = useState({
    value: contract.premiumAmount,
    isBitcoin: true,
  })
  const [feeRate, setFeeRate] = useState(contract.feeRate)
  const [maturityDate, setMaturityDate] = useState(
    DateTime.fromMillis(contract.maturityTime)
  )

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

  const [oracleInfo, setOracleInfo] = useState(props.oracleInfo)

  useEffect(() => {
    setOracleInfo(props.oracleInfo)
  }, [props.oracleInfo])

  const validateFeeRate: (feeRateVal?: number) => boolean = (
    feeRateVal: number = feeRate
  ) => {
    const isValid = Number.isInteger(feeRateVal) && feeRateVal > 1
    return validationBase(
      isValid,
      setFeeRateError,
      setFeeRateMessage,
      'Must be an integer number greater or equal to 2'
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
    let isValid = localCollateralValue > 2000 || remoteCollateralValue > 2000
    const message = 'One collateral needs to be greater than 2000 satoshis'
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

  const validateOutcomes: (
    outcomes?: Outcome[],
    localCollateralVal?: number,
    remoteCollateralVal?: number,
    validateLength?: boolean
  ) => boolean = (
    outcomes: Outcome[] = props.data,
    localCollateralVal: number = localCollateral.value,
    remoteCollateralVal: number = remoteCollateral.value,
    validateLength = true
  ) => {
    const firstPayout =
      outcomes.length > 0 ? outcomes[0].local + outcomes[0].remote : 0
    const validations: (() => boolean)[] = [
      (): boolean =>
        validationBase(
          validateLength ? outcomes.length > 0 : true,
          setOutcomesError,
          setOutcomesMessage,
          'Needs at least one outcome'
        ),
      (): boolean =>
        validationBase(
          outcomes.every(x => x.local + x.remote === firstPayout),
          setOutcomesError,
          setOutcomesMessage,
          'The sum of all outcomes payout need to be the same'
        ),
      (): boolean =>
        validationBase(
          outcomes.length > 0
            ? localCollateralVal + remoteCollateralVal === firstPayout
            : true,
          setOutcomesError,
          setOutcomesMessage,
          'The sum of the collaterals must be equal to the sum of the payouts'
        ),
    ]

    for (const validation of validations) {
      if (!validation()) {
        return false
      }
    }

    return true
  }

  useEffect(() => {
    if (outcomesError && props.data.length > 0) {
      validateOutcomes()
    }
  }, [outcomesError, props.data.length, validateOutcomes])

  const validate: () => boolean = () => {
    const validations: (() => boolean)[] = [
      validateFeeRate,
      validateRemoteParty,
      validateCollaterals,
      validateOutcomes,
    ]
    return validations.map(x => x()).reduce((acc, cur) => acc && cur)
  }

  const handleMaturityChange = (date: DateTime): void => {
    setMaturityDate(date)
  }

  const handleTabChange = (index: number): void => {
    setTabIndex(index)
    props.onTabChange(index)
  }

  const handleUserSelect = (username: string): void => {
    setRemoteParty(username)
    validateRemoteParty(username)
    setOpenAddressBook(false)
  }

  const handlePublish = (): void => {
    if (!validate()) {
      return
    }
    const publishContract: Contract = {
      id: contract.id,
      counterPartyName: remoteParty,
      feeRate: feeRate,
      localCollateral: localCollateral.value,
      remoteCollateral: remoteCollateral.value,
      outcomes: props.data,
      state: ContractState.Initial,
      maturityTime: maturityDate.toMillis(),
      premiumAmount: optionPremium.value,
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
                onChange={(value: number): void => {
                  setLocalCollateral({
                    value,
                    isBitcoin: localCollateral.isBitcoin,
                  })
                  validateCollaterals(value)
                  validateOutcomes(undefined, value, undefined, false)
                }}
                label={'Local collateral'}
              />
              <BitcoinInput
                value={remoteCollateral.value}
                isBitcoin={remoteCollateral.isBitcoin}
                error={remoteCollateralError}
                helperText={remoteCollateralMessage}
                onCoinChange={(isBitcoin: boolean): void => {
                  const collat = remoteCollateral
                  collat.isBitcoin = isBitcoin
                  setRemoteCollateral(collat)
                }}
                onChange={(value: number): void => {
                  setRemoteCollateral({
                    value,
                    isBitcoin: remoteCollateral.isBitcoin,
                  })
                  validateCollaterals(localCollateral.value, value)
                  validateOutcomes(undefined, undefined, value, false)
                }}
                label={'Remote collateral'}
              />
              <BitcoinInput
                value={optionPremium.value}
                isBitcoin={optionPremium.isBitcoin}
                onCoinChange={(isBitcoin: boolean): void => {
                  const collat = optionPremium
                  collat.isBitcoin = isBitcoin
                  setOptionPremium(collat)
                }}
                onChange={(value: number): void => {
                  setOptionPremium({
                    value,
                    isBitcoin: optionPremium.isBitcoin,
                  })
                }}
                label={'Option Premium'}
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
                <FormLabel color="secondary">Maturity date</FormLabel>
                {oracleInfo && (
                  <DateTimeSelect
                    date={maturityDate}
                    oracleInfo={oracleInfo}
                    onChange={handleMaturityChange}
                    minimumDate={DateTime.utc().plus({ minutes: 1 })}
                  />
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
