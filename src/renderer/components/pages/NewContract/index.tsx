import React, { FC } from 'react'

import NewContractTemplate from '../../templates/NewContractTemplate'

const NewContractPage: FC = () => {
  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <NewContractTemplate />
    </div>
  )
}

export default NewContractPage
