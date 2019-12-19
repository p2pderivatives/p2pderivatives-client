const { createMockServer } = require('grpc-mock')

module.exports = function getMockServer() {
  return createMockServer({
    protoPath: './src/browser/api/grpc/gen/authentication.proto',
    packageName: 'authentication',
    serviceName: 'Authentication',
    rules: [
      {
        method: 'login',
        input: { account: 'test', password: 'test' },
        output: {
          name: 'test',
          account: 'test',
          requirePasswordChange: false,
          token: {
            accessToken: 'testToken',
            refreshToken: 'testRefresh',
            expiresIn: 3600,
          },
        },
      },
      {
        method: 'login',
        input: { account: 'error', password: 'test' },
        error: { code: 17, message: 'Authentication failed!' },
      },
      {
        method: 'logout',
        input: { refreshToken: 'testRefresh' },
        output: {},
      },
      {
        method: 'refresh',
        input: { refreshToken: 'testRefresh' },
        output: {
          token: {
            accessToken: 'testToken',
            refreshToken: 'testRefresh',
            expiresIn: 3600,
          },
        },
      },
    ],
  })
}
