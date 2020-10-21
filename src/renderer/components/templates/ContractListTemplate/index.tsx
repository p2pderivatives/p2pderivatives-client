import { makeStyles } from '@material-ui/core'
import React, { FC, useEffect, useState } from 'react'
import { Contract, ContractState } from '../../../../common/models/dlc/Contract'
import Tabs, { TabItem } from '../../molecules/Tabs'
import DataGrid from '../../organisms/DataGrid'
import MainLayout from '../../organisms/MainLayout'

type ContractListTemplateProps = {
  username: string
  data: Contract[]
  onContractClicked: (contractId: string) => void
}

const useStyles = makeStyles({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#303855',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  contentDiv: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
})

const tabItems: TabItem[] = [
  { label: 'All' },
  { label: 'Offered' },
  { label: 'Completed' },
]

const tabStatuses: Array<Array<ContractState>> = [
  [],
  [ContractState.Offered],
  [ContractState.Refunded, ContractState.Closed],
]

const ContractListTemplate: FC<ContractListTemplateProps> = (
  props: ContractListTemplateProps
) => {
  const classes = useStyles()
  const [contractData, setContractData] = useState<Contract[]>(props.data)
  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    setContractData(props.data)
    const newOffered = props.data.filter(
      c => c.state === ContractState.Offered && !c.isLocalParty
    ).length
    const offeredIndex = tabStatuses.findIndex(arr =>
      arr.some(c => c === ContractState.Offered)
    )
    tabItems[offeredIndex].new = newOffered
  }, [props.data, setContractData])

  const handleTabChange = (tabIdx: number): void => {
    const statuses = tabStatuses[tabIdx]
    if (statuses.length === 0) {
      setContractData(props.data)
    } else {
      const filteredData = props.data.filter(c => {
        let show = statuses.some(state => state === c.state)
        if (
          statuses.some(state => state === ContractState.Offered) &&
          c.state === ContractState.Offered
        ) {
          show = show && !c.isLocalParty
        }
        return show
      })
      setContractData(filteredData)
    }
    setTabIndex(tabIdx)
  }

  const handleRowClicked = (rowData: string[]): void => {
    props.onContractClicked(rowData[0])
  }

  return (
    <div className={classes.rootContainer}>
      <MainLayout>
        <div className={classes.contentDiv}>
          <Tabs
            items={tabItems}
            value={tabIndex}
            onTabChange={handleTabChange}
          />
          <DataGrid
            title={'All'}
            data={contractData}
            onRowClick={handleRowClicked}
          />
        </div>
      </MainLayout>
    </div>
  )
}

export default ContractListTemplate
