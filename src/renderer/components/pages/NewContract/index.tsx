import { push } from 'connected-react-router'
import { DateTime, Duration } from 'luxon'
import React, { FC, useEffect, useState } from 'react'
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector as useReduxSelector,
} from 'react-redux'
import { RouteChildrenProps } from 'react-router'
import { Contract } from '../../../../common/models/dlc/Contract'
import { Outcome } from '../../../../common/models/dlc/Outcome'
import { OracleAssetConfiguration } from '../../../../common/models/oracle/oracle'
import { isFailed } from '../../../../common/utils/failable'
import { BitcoinIPC } from '../../../ipc/consumer/BitcoinIPC'
import FileIPC from '../../../ipc/consumer/FileIPC'
import OracleIPC from '../../../ipc/consumer/OracleIPC'
import { ApplicationState } from '../../../store'
import { offerRequest } from '../../../store/dlc/actions'
import { userListRequest } from '../../../store/user/actions'
import { merge } from '../../../util/outcome-merger'
import NewContractTemplate from '../../templates/NewContractTemplate'

const { dialog } = window.require('electron').remote

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const oracleIPC = new OracleIPC()
const bitcoindIPC = new BitcoinIPC()
const fileIPC = new FileIPC()

const NewContractPage: FC<RouteChildrenProps<{ id: string }>> = (
  props: RouteChildrenProps<{ id: string }>
) => {
  const dispatch = useDispatch()

  const [tab, setTab] = useState(0)
  const [oracleInfo, setOracleInfo] = useState<OracleAssetConfiguration>()
  const userList = useSelector(state => state.user.userList)
  const contractId = props.match ? props.match.params.id : ''
  const contracts = useSelector(state => state.dlc.contracts)
  const selectedContract = contracts.find(c => c.id === contractId)
  const [actualOutcomes, setActualOutcomes] = useState<Outcome[]>(
    selectedContract ? [...selectedContract.outcomes] : []
  )
  const [outcomesList, setOutcomesList] = useState<Outcome[]>(
    selectedContract ? merge([...selectedContract.outcomes]) : []
  )

  const [utxoAmount, setUtxoAmount] = useState(0)

  const handleCSVImport = (): void => {
    dialog.showOpenDialog({ properties: ['openFile'] }).then(async files => {
      if (files !== undefined) {
        const filepath = files.filePaths[0]
        const res = await fileIPC.events.parseOutcomes({
          outcomesPath: filepath,
        })
        if (isFailed(res)) {
          throw res.error
        }
        const outcomes = merge(res.value)
        setActualOutcomes(res.value)
        setOutcomesList(outcomes)
        setTab(1)
      }
    })
  }

  const handlePublish = (contract: Contract): void => {
    const contractWithActualOutcomes = {
      ...contract,
      outcomes: actualOutcomes,
    }
    dispatch(offerRequest(contractWithActualOutcomes))
    dispatch(push('/main'))
  }

  const handleCancel = (): void => {
    dispatch(push('/main'))
  }

  const updateOracleInfo = async (): Promise<void> => {
    const res = await oracleIPC.events.getAssetConfig('btcusd')
    if (isFailed(res)) {
      throw res.error
    }
    setOracleInfo({
      startDate: DateTime.fromISO(res.value.startDate, { setZone: true }),
      frequency: Duration.fromISO(res.value.frequency),
      range: Duration.fromISO(res.value.range),
    })
  }

  const updateUtxoAmount = async (): Promise<void> => {
    const res = await bitcoindIPC.events.getUtxoAmount()
    if (isFailed(res)) {
      throw res.error
    }
    setUtxoAmount(res.value)
  }

  useEffect(() => {
    dispatch(userListRequest())
    updateOracleInfo()
    updateUtxoAmount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <NewContractTemplate
        onCSVImport={handleCSVImport}
        data={outcomesList}
        users={userList}
        tab={tab}
        onTabChange={(index): void => setTab(index)}
        onPublish={handlePublish}
        onCancel={handleCancel}
        oracleInfo={oracleInfo}
        contract={selectedContract}
        utxoAmount={utxoAmount}
      />
    </div>
  )
}

export default NewContractPage
