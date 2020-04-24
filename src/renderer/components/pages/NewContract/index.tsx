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

const { dialog } = window.require('electron').remote

const useSelector: TypedUseSelectorHook<ApplicationState> = useReduxSelector

const NewContractPage: FC = () => {
  const dispatch = useDispatch()

  const [tab, setTab] = useState(0)
  const outcomesList = useSelector(state => state.file.parsedOutcomes)
  const parsed = useSelector(state => state.file.parsed)
  const processing = useSelector(state => state.file.processing)

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

  const handleCancel = (): void => {
    dispatch(goBack())
  }

  useEffect(() => {
    if (parsed && !processing) {
      console.log('set tab')
      setTab(1)
    }
  }, [parsed, processing, outcomesList])

  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <NewContractTemplate
        onCSVImport={handleCSVImport}
        data={outcomesList}
        tab={tab}
        onTabChange={(index): void => setTab(index)}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default NewContractPage
