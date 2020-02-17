import React from 'react'
import StoryRouter from 'storybook-react-router'
import NewContractTemplate from './'

export default {
  title: 'Components/Templates/NewContractListTemplate',
  decorators: [StoryRouter()],
}

export const newContract = () => (
  <div style={{ width: 1366, height: 768 }}>
    <NewContractTemplate />
  </div>
)
