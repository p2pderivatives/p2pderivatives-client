import React from 'react'
import StoryRouter from 'storybook-react-router'
import ContractListTemplate from './'

export default {
  title: 'Components/Templates/ContractListTemplate',
  decorators: [StoryRouter()],
}

export const contractList = () => (
  <div style={{ width: 1366, height: 768 }}>
    <ContractListTemplate />
  </div>
)
