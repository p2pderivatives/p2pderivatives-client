const { createMockServer } = require('grpc-mock')

module.exports = function getMockServer() {
  return createMockServer({
    protoPath: './src/browser/api/grpc/gen/user.proto',
    packageName: 'usercontroller',
    serviceName: 'User',
    rules: [
      {
        method: 'registerUser',
        input: { name: 'test', password: 'test' },
        output: { id: 1, name: 'test' },
      },
      {
        method: 'unregisterUser',
        input: {},
        output: {},
      },
      {
        method: 'getUserStatuses',
        streamType: 'server',
        input: {},
        stream: [
          { output: { name: 'user1', status: 0 } },
          { output: { name: 'user2', status: 0 } },
          { output: { name: 'user1', status: 1 } },
        ],
      },
      {
        method: 'getUserList',
        streamType: 'server',
        input: {},
        stream: [
          { output: { name: 'user1' } },
          { output: { name: 'user2' } },
          { output: { name: 'user3' } },
          { output: { name: 'user4' } },
        ],
      },
    ],
  })
}
