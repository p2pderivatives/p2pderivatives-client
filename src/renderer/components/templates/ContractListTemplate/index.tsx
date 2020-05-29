import React, { FC, useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core'

import Tabs, { TabItem } from '../../molecules/Tabs'
import DataGrid from '../../organisms/DataGrid'
import MainLayout from '../../organisms/MainLayout'
import { ContractSimple } from '../../../../common/models/ipc/ContractSimple'
import { ContractState } from '../../../../common/models/dlc/ContractState'

type ContractListTemplateProps = {
  data: ContractSimple[]
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
  { label: 'All', new: 0 },
  { label: 'Offered', new: 0 },
  { label: 'Completed', new: 0 },
]

const tabStatuses: Array<Array<ContractState>> = [
  [],
  [ContractState.Offered] as Array<ContractState>,
  [
    ContractState.MutualClosed,
    ContractState.Refunded,
    ContractState.UnilateralClosed,
  ] as Array<ContractState>,
]

const ContractListTemplate: FC<ContractListTemplateProps> = (
  props: ContractListTemplateProps
) => {
  const classes = useStyles()
  const [contractData, setContractData] = useState<ContractSimple[]>([])
  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    setContractData(props.data)
    const newOffered = props.data.filter(c => c.state === ContractState.Offered)
      .length
    const offeredIndex = tabStatuses.findIndex(arr =>
      arr.some(c => c === ContractState.Offered)
    )
    tabItems[offeredIndex].new = newOffered
  }, [props.data])

  const handleTabChange = (tabIdx: number): void => {
    const statuses = tabStatuses[tabIdx]
    if (statuses.length === 0) {
      setContractData(props.data)
    } else {
      const filteredData = props.data.filter(c =>
        statuses.some(state => state === c.state)
      )
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
            // eslint-disable-next-line @typescript-eslint/no-empty-function
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
