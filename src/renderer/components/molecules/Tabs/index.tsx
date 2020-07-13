import { makeStyles } from '@material-ui/core'
import Badge from '@material-ui/core/Badge'
import Paper from '@material-ui/core/Paper'
import MuiTab from '@material-ui/core/Tab'
import MuiTabs from '@material-ui/core/Tabs'
import React, { FC } from 'react'

export type TabItem = {
  label: string
  new?: number
}

export type TabsProps = {
  items: TabItem[]
  value: number
  onTabChange: (tabIndex: number) => void
}

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#303855',
    color: theme.palette.text.primary,
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.secondary.dark,
  },
  indicator: {
    backgroundColor: theme.palette.primary.main,
  },
}))

const Tabs: FC<TabsProps> = (props: TabsProps) => {
  const classes = useStyles()

  const handleTabChange = (
    event: React.ChangeEvent<{}>,
    newValue: number
  ): void => {
    props.onTabChange(newValue)
  }

  return (
    <Paper elevation={0}>
      <MuiTabs
        value={props.value}
        onChange={handleTabChange}
        classes={{ root: classes.root, indicator: classes.indicator }}
      >
        {props.items.map((tab, i) => {
          return (
            <MuiTab
              key={tab.label}
              label={
                <Badge
                  badgeContent={tab.new}
                  color="primary"
                  invisible={!tab.new}
                >
                  {tab.label}
                </Badge>
              }
            ></MuiTab>
          )
        })}
      </MuiTabs>
    </Paper>
  )
}

Tabs.defaultProps = {
  items: [],
  value: 0,
}
export default Tabs
