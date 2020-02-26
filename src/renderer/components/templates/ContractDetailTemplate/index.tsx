import React, { FC } from 'react'
import { makeStyles, Typography, Grid, Link } from '@material-ui/core'
import MainLayout from '../../organisms/MainLayout'

const useStyles = makeStyles({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#303855',
  },
  contentDiv: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  contractDiv: {
    width: '60%',
  },
  titleBorder: {
    width: '48rem',
    borderBottom: '1px solid #B3B6C2',
    margin: '1rem 0rem',
  },
  dataSubtitle: {
    marginTop: '4rem',
  },
  subtitleBorder: {
    width: '16rem',
    borderBottom: '1px solid #B3B6C2',
    margin: '1rem 0rem',
  },
  backLink: {
    fontSize: '0.75rem',
    color: '#67B1F6',
    margin: '1rem 0rem',
    '&:hover': {
      textDecoration: 'none',
      cursor: 'pointer',
    },
  },
  dataTitle: {
    fontWeight: 'bold',
  },
})

const ContractDetailTemplate: FC = () => {
  const classes = useStyles()

  return (
    <div className={classes.rootContainer}>
      <MainLayout>
        <div className={classes.contentDiv}>
          <Link className={classes.backLink} variant="body2">
            🠐 ALL CONTRACTS
          </Link>
          <div className={classes.contractDiv}>
            <Typography variant="h4" color="textPrimary">
              {'XX00001'}
            </Typography>
            <div className={classes.titleBorder}></div>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <div>
                  <Typography
                    className={classes.dataTitle}
                    variant="body2"
                    color="textPrimary"
                  >
                    State
                  </Typography>
                  <Typography variant="body2" color="textPrimary">
                    Published
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div>
                  <Typography
                    className={classes.dataTitle}
                    variant="body2"
                    color="textPrimary"
                  >
                    Created at (GMT)
                  </Typography>
                  <Typography variant="body2" color="textPrimary">
                    2020-02-02 20:00:02
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div>
                  <Typography
                    className={classes.dataTitle}
                    variant="body2"
                    color="textPrimary"
                  >
                    Approved at (GMT)
                  </Typography>
                  <Typography variant="body2" color="textPrimary">
                    -
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div>
                  <Typography
                    className={classes.dataTitle}
                    variant="body2"
                    color="textPrimary"
                  >
                    Published from
                  </Typography>
                  <Typography variant="body2" color="textPrimary">
                    John Doe
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div>
                  <Typography
                    className={classes.dataTitle}
                    variant="body2"
                    color="textPrimary"
                  >
                    Published to
                  </Typography>
                  <Typography variant="body2" color="textPrimary">
                    Nice company, Inc.
                  </Typography>
                </div>
              </Grid>
            </Grid>
            <Typography
              className={classes.dataSubtitle}
              variant="h6"
              color="textPrimary"
            >
              {'General term'}
            </Typography>
            <div className={classes.subtitleBorder}></div>
            <Grid container spacing={3}>
              <Grid item xs={8}>
                <div>
                  <Typography
                    className={classes.dataTitle}
                    variant="body2"
                    color="textPrimary"
                  >
                    Local Party
                  </Typography>
                  <Typography variant="body2" color="textPrimary">
                    John Doe
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={8}>
                <div>
                  <Typography
                    className={classes.dataTitle}
                    variant="body2"
                    color="textPrimary"
                  >
                    Remote Party
                  </Typography>
                  <Typography variant="body2" color="textPrimary">
                    Nice company, Inc.
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={8}>
                <div>
                  <Typography
                    className={classes.dataTitle}
                    variant="body2"
                    color="textPrimary"
                  >
                    Contract ID
                  </Typography>
                  <Typography variant="body2" color="textPrimary">
                    TFC0123-01
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </MainLayout>
    </div>
  )
}

export default ContractDetailTemplate
