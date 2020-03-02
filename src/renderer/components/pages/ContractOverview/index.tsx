import React, { FC } from 'react'

import ContractListTemplate from '../../templates/ContractListTemplate'

const ContractOverviewPage: FC = () => {
  return (
    <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <ContractListTemplate />
    </div>
  )
}

export default ContractOverviewPage
