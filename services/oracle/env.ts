import { OracleInfo } from '../../src/common/oracle/oracleInfo'

export const TEST_ORACLE_CONFIG: Readonly<OracleInfo> = {
  name: 'testoracle',
  uri: `http://${process.env.ORACLE_HOST || 'localhost'}:${process.env
    .ORACLE_PORT || '8080'}`,
}

export const TEST_ASSET_ID = 'btcusd'
