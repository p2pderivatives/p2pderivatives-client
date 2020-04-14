const { createMockServer } = require('grpc-mock')

module.exports = function getMockServer() {
  return createMockServer({
    protoPath: './src/browser/api/grpc/gen/authentication.proto',
    packageName: 'authentication',
    serviceName: 'Authentication',
    rules: [
      {
        method: 'login',
        input: { name: 'test', password: 'test' },
        output: {
          name: 'test',
          requirePasswordChange: false,
          token: {
            accessToken: 'testToken',
            refreshToken: 'testRefresh',
            expiresIn: 1,
          },
        },
      },
      {
        method: 'login',
        input: { name: 'error', password: 'test' },
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
            accessToken: 'refreshToken',
            refreshToken: 'testRefresh',
            expiresIn: 1,
          },
        },
      },
      {
        method: 'updatePassword',
        input: { oldPassword: 'old', newPassword: 'new' },
        output: {},
      },
    ],
  })
}
