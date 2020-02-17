import React, { FC, useState } from 'react'

import {
  makeStyles,
  Typography,
  Box,
  Grid,
  IconButton,
} from '@material-ui/core'
import TabPanel from '@material-ui/core/Tab'
import Contacts from '@material-ui/icons/Contacts'

import Tabs, { TabItem } from '../../molecules/Tabs'
import MainLayout from '../../organisms/MainLayout'
import TextInput from '../../atoms/TextInput'
import Button from '../../atoms/Button'
import CETxGrid from '../../organisms/CETxGrid'

const useStyles = makeStyles({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#303855',
  },
  content: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#E4E7EF',
  },
  titleBorder: {
    width: '12rem',
    borderBottom: '1px solid #B3B6C2',
    margin: '0.5rem 0',
  },
  formGrid: {
    width: '38rem',
    '& > div': {
      marginTop: '1.5rem',
    },
  },
})

const tabItems: TabItem[] = [{ label: 'General' }, { label: 'CETx' }]
const data = [
  {
    fixingPrice: 3000.001,
    partyArec: 0.5,
    partyBrec: 0.0,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.45,
    partyBrec: 0.05,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.4,
    partyBrec: 0.1,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.35,
    partyBrec: 0.15,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.3,
    partyBrec: 0.2,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.25,
    partyBrec: 0.25,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.2,
    partyBrec: 0.3,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.15,
    partyBrec: 0.35,
  },
  {
    fixingPrice: 3000.001,
    partyArec: 0.1,
    partyBrec: 0.4,
  },
]

const NewContractListTemplate: FC = () => {
  const classes = useStyles()
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <div className={classes.rootContainer}>
      <MainLayout>
        <Tabs items={tabItems} onTabChange={idx => setTabIndex(idx)} />
        {tabIndex === 0 && (
          <Box className={classes.content}>
            <Typography variant="h6">General term</Typography>
            <div className={classes.titleBorder}></div>
            <Typography variant="caption">Your work is auto-saved.</Typography>
            <Grid className={classes.formGrid} container direction="column">
              <TextInput
                label={'Party A'}
                inputProps={{ readOnly: true }}
                value={'John Doe'}
                helperText={'Read only'}
              ></TextInput>
              <TextInput
                label={'Party B'}
                value={'Nice company, Inc'}
                InputProps={{
                  endAdornment: (
                    <IconButton style={{ color: '#67B1F6' }}>
                      <Contacts />
                    </IconButton>
                  ),
                }}
              ></TextInput>
              <TextInput
                label={'Contract ID'}
                value={'Placeholder'}
                disabled
              ></TextInput>
              <TextInput
                label={'Product'}
                value={'TFC'}
                helperText={'Read only'}
              ></TextInput>
              <div>
                <Button
                  variant="contained"
                  disabled
                  style={{ marginRight: '1rem' }}
                >
                  Publish
                </Button>
                <Button variant="outlined" color="secondary">
                  Cancel
                </Button>
              </div>
            </Grid>
          </Box>
        )}
        {tabIndex === 1 && (
          <Box display={tabIndex === 1 ? 'inline' : 'none'}>
            <CETxGrid title={'All contracts'} data={data} />
          </Box>
        )}
      </MainLayout>
    </div>
  )
}

export default NewContractListTemplate
