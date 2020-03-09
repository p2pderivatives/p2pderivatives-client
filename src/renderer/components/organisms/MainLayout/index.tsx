import React, { FC } from 'react'

import { makeStyles } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

import StatusBar from '../../molecules/StatusBar'
import Fab from '../../atoms/Fab'

type LayoutProps = {
  children?: React.ReactNode
}

const useStyles = makeStyles({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#303855',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  contentRoot: {
    height: '100%',
    flexGrow: 2,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'auto',
  },
  sidebar: {
    flexBasis: '20%',
  },
  content: {
    flexGrow: 2,
    display: 'flex',
    flexDirection: 'column',
  },
})

const MainLayout: FC<LayoutProps> = (props: LayoutProps) => {
  const classes = useStyles()
  return (
    <div className={classes.rootContainer}>
      <StatusBar />
      <div className={classes.contentRoot}>
        <div className={classes.sidebar}>
          <div className={classes.buttonContainer}>
            <Fab variant="extended" color="primary">
              <AddIcon />
              {'New contract'}
            </Fab>
          </div>
        </div>
        <div className={classes.content}>{props.children}</div>
      </div>
    </div>
  )
}

export default MainLayout
