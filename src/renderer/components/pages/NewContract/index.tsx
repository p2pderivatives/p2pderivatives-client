import React, { FC, useState, useEffect } from 'react'

import {
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
  useDispatch,
} from 'react-redux'

import NewContractTemplate from '../../templates/NewContractTemplate'
import { ApplicationState } from '../../../store'
import { outcomeRequest } from '../../../store/file/actions'
import { goBack } from 'connected-react-router'
import { userListRequest } from '../../../store/user/actions'
import { offerRequest } from '../../../store/dlc/actions'
import { ContractSimple } from '../../../../common/models/ipc/ContractSimple'

const { dialog } = window.require('electron').remote

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const NewContractPage: FC = () => {
  const dispatch = useDispatch()

  const [tab, setTab] = useState(0)
  const outcomesList = useSelector(state => state.file.parsedOutcomes)
  const parsed = useSelector(state => state.file.parsed)
  const processing = useSelector(state => state.file.processing)
  const userList = useSelector(state => state.user.userList)

  const dispatchOutcomeRequest = (filepath: string): void => {
    dispatch(outcomeRequest(filepath))
  }

  const handleCSVImport = (): void => {
    dialog.showOpenDialog({ properties: ['openFile'] }).then(async files => {
      if (files !== undefined) {
        const filepath = files.filePaths[0]
        dispatchOutcomeRequest(filepath)
      }
    })
  }

  const handlePublish = (contract: ContractSimple): void => {
    dispatch(offerRequest(contract))
  }

  const handleCancel = (): void => {
    dispatch(goBack())
  }

  useEffect(() => {
    dispatch(userListRequest())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (parsed && !processing) {
      setTab(1)
    }
  }, [parsed, processing, outcomesList])

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
      />
    </div>
  )
}

export default NewContractPage
