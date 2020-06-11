import React, { FC, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles, Typography, Grid, Link } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import MainLayout from '../../organisms/MainLayout'
import Tabs, { TabItem } from '../../molecules/Tabs'
import OutcomesGrid from '../../organisms/OutcomesGrid'
import Button from '../../atoms/Button'
import { ContractSimple } from '../../../../common/models/ipc/ContractSimple'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import ContractView from '../../organisms/ContractView'

type ContractDetailTemplateProps = {
  data: ContractSimple
  isProposal: boolean
  acceptContract?: () => void
  rejectContract?: () => void
  cancel?: () => void
}

const useStyles = makeStyles({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#303855',
  },
  contentDiv: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  contractDiv: {
    width: '60%',
    marginTop: '1.5rem',
  },
  titleBorder: {
    width: '48rem',
    borderBottom: '1px solid #B3B6C2',
    margin: '1rem 0rem',
  },
  dataSubtitle: {
    marginTop: '4rem',
  },
  subtitleBorder: {
    width: '16rem',
    borderBottom: '1px solid #B3B6C2',
    margin: '1rem 0rem',
  },
  backLink: {
    fontSize: '0.75rem',
    color: '#67B1F6',
    margin: '1rem 0rem',
    '&:hover': {
      textDecoration: 'none',
      cursor: 'pointer',
    },
  },
  dataTitle: {
    fontWeight: 'bold',
  },
  buttonDiv: {
    display: 'flex',
    justifyContent: 'space-evenly',
    marginTop: '3rem',
  },
})

const tabItems: TabItem[] = [{ label: 'General' }, { label: 'Outcomes' }]

function ContractTab(contract: ContractSimple) {}

const ContractDetailTemplate: FC<ContractDetailTemplateProps> = (
  props: ContractDetailTemplateProps
) => {
  const classes = useStyles()
  const contract = props.data

  const [tabIndex, setTabIndex] = useState(0)

  const handleTabChange = (index: number): void => {
    setTabIndex(index)
  }

  const handleAccept = (): void => {
    if (props.acceptContract) props.acceptContract()
  }

  const handleReject = (): void => {
    if (props.rejectContract) props.rejectContract()
  }

  const handleCancel = (): void => {
    if (props.cancel) props.cancel()
  }

  return (
    <div className={classes.rootContainer}>
      <MainLayout>
        <div className={classes.contentDiv}>
          <Link
            className={classes.backLink}
            variant="body2"
            component={RouterLink}
            to="/main"
          >
            🠐 ALL CONTRACTS
          </Link>
          <Tabs
            items={tabItems}
            value={tabIndex}
            onTabChange={(idx): void => handleTabChange(idx)}
          />
          {tabIndex === 0 && (
            <ContractView
              data={contract}
              cancel={() => handleCancel()}
              acceptContract={() => handleAccept()}
              rejectContract={() => handleReject()}
            />
          )}
          {tabIndex === 1 && (
            <Box display={tabIndex === 1 ? 'inline' : 'none'}>
              <OutcomesGrid title={'All contracts'} data={contract.outcomes} />
            </Box>
          )}
        </div>
      </MainLayout>
    </div>
  )
}

export default ContractDetailTemplate
