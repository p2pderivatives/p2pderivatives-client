import React from 'react'
import Tabs, { TabItem } from '.'

export default {
  title: 'Components/Molecules/Tabs',
  parameters: {
    backgrounds: [{ name: 'p2pd', value: '#303855' }],
  },
}

const items: TabItem[] = [
  { label: 'All' },
  { label: 'Approved' },
  { label: 'Confirmed' },
  { label: 'Requested' },
]

export const tabs = () => <Tabs items={items} initialIndex={1} />
