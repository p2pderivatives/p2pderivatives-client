import React, { FC } from 'react'

import { makeStyles } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import MuiTabs from '@material-ui/core/Tabs'
import MuiTab from '@material-ui/core/Tab'

export type TabItem = {
  label: string
}

export type TabsProps = {
  items: TabItem[]
  initialIndex?: number
}

const useStyles = makeStyles({
  root: {
    backgroundColor: '#303855',
    color: '#E4E7EF',
    borderBottom: '1px solid #B3B6C1',
  },
  indicator: {
    backgroundColor: '#3AF3B1',
  },
})

const Tabs: FC<TabsProps> = (props: TabsProps) => {
  const classes = useStyles()
  const [tabValue, setTabValue] = React.useState(props.initialIndex)

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Paper elevation={0}>
      <MuiTabs
        value={tabValue}
        onChange={handleTabChange}
        classes={{ root: classes.root, indicator: classes.indicator }}
      >
        {props.items.map((tab, i) => {
          return <MuiTab key={tab.label} label={tab.label}></MuiTab>
        })}
      </MuiTabs>
    </Paper>
  )
}

Tabs.defaultProps = {
  items: [],
  initialIndex: 0,
}
export default Tabs
