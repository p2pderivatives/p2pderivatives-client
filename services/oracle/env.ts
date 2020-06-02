import { OracleConfig } from '../../src/browser/api/oracle'

export const TEST_ORACLE_CONFIG: Readonly<OracleConfig> = {
  baseUrl: `http://${process.env.ORACLE_HOST || 'localhost'}:${process.env
    .ORACLE_PORT || '8080'}`,
}

export const TEST_ASSET_ID = 'btcusd'
