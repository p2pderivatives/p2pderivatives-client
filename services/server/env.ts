export const DEFAULT_PASS = '123456B@n'
export const TEST_USER = {
  username: 'test_user',
  pass: DEFAULT_PASS,
  name: 'test_user',
}

export const TEST_UPDATE_PASSWORD_USER = {
  username: 'update_pass_user',
  pass: DEFAULT_PASS,
  name: 'update_pass_user',
}

export const TEST_UNREGISTER_USER = {
  username: 'unregister_user',
  pass: DEFAULT_PASS,
  name: 'unregister_user',
}

export const TEST_GRPC_CONFIG: Readonly<{ host: string; secure: boolean }> = {
  host: `${process.env.SERVER_HOST || 'localhost'}:${process.env.SERVER_PORT ||
    '8081'}`,
  secure: false,
}

export const TEST_SERVER_CONFIG = {
  expiration: 2000,
}
