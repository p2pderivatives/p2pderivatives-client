import React, { FC, useState, useEffect } from 'react'

import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'

import NewContractTemplate from '../../templates/NewContractTemplate'
import { ApplicationState } from '../../../store'
import { goBack } from 'connected-react-router'
import { userListRequest } from '../../../store/user/actions'
import FileIPC from '../../../ipc/FileIPC'
import { Outcome } from '../../../../common/models/dlc/Outcome'
import OracleIPC from '../../../ipc/OracleIPC'
import { merge } from '../../../util/outcome-merger'
import { OracleAssetConfiguration } from '../../../../common/oracle/oracle'

const { dialog } = window.require('electron').remote

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const NewContractPage: FC = () => {
  const dispatch = useDispatch()

  const [tab, setTab] = useState(0)
  const [outcomesList, setOutcomesList] = useState<Outcome[]>([])
  const [oracleInfo, setOracleInfo] = useState<OracleAssetConfiguration>()
  const userList = useSelector(state => state.user.userList)

  const handleCSVImport = (): void => {
    dialog.showOpenDialog({ properties: ['openFile'] }).then(async files => {
      if (files !== undefined) {
        const filepath = files.filePaths[0]
        const parsedOutcomes = await new FileIPC().parseOutcomes(filepath)
        const outcomes = merge(parsedOutcomes)
        setOutcomesList(outcomes)
        setTab(1)
      }
    })
  }

  const handleCancel = (): void => {
    dispatch(goBack())
  }

  const getOracleInfo = async (): Promise<void> => {
    const info = await OracleIPC.getOracleConfig('btcusd')
    setOracleInfo(info)
  }

  useEffect(() => {
    dispatch(userListRequest())
    getOracleInfo()
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
        onCancel={handleCancel}
        oracleInfo={oracleInfo}
      />
    </div>
  )
}

export default NewContractPage
