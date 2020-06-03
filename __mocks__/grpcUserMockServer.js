const { createMockServer } = require('grpc-mock')

module.exports = function getMockServer(dlcMessages) {
  return createMockServer({
    protoPath: './gen-grpc/user.proto',
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
        method: 'getConnectedUsers',
        streamType: 'server',
        input: {},
        stream: [
          { output: { name: 'user1' } },
          { output: { name: 'user2' } },
          { output: { name: 'user1' } },
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
      {
        method: 'receiveDlcMessages',
        streamType: 'server',
        input: {},
        stream: dlcMessages,
      },
      {
        method: 'sendDlcMessage',
        input: '[^]*',
        output: {},
      },
    ],
  })
}
