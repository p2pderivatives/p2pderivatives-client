import React, { FC } from 'react'

import { makeStyles } from '@material-ui/core'

import MainLayout, { LayoutProps } from '../../organisms/MainLayout'

export type SettingsProp = Omit<LayoutProps, 'settingsConfig' | 'showSidebar'>

const useStyles = makeStyles({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#303855',
  },
})

const SettingsTemplate: FC<LayoutProps> = (props: LayoutProps) => {
  const classes = useStyles()

  return (
    <div className={classes.rootContainer}>
      <MainLayout onBack={props.onBack} settingsConfig={true}>
        {props.children}
      </MainLayout>
    </div>
  )
}

export default SettingsTemplate
