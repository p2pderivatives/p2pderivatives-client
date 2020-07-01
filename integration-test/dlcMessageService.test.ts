import { DEFAULT_PASS, TEST_GRPC_CONFIG } from '../services/server/env'
import { GrpcAuth } from '../src/browser/api/grpc/GrpcAuth'
import { GrpcClient } from '../src/browser/api/grpc/GrpcClient'
import {
  DlcMessageType,
  RejectMessage,
} from '../src/browser/dlc/models/messages'

function sleep(ms: number): Promise<unknown> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

describe('dlc-message-service', () => {
  describe('client 1 sends client 2 receives', () => {
    let auth1: GrpcAuth
    let client1: GrpcClient
    let auth2: GrpcAuth
    let client2: GrpcClient
    beforeEach(() => {
      auth1 = new GrpcAuth()
      client1 = new GrpcClient(TEST_GRPC_CONFIG, auth1)
      auth2 = new GrpcAuth()
      client2 = new GrpcClient(TEST_GRPC_CONFIG, auth2)
    })
    test('succeeds', async () => {
      const user1 = {
        username: 'sendReceive1',
        pass: DEFAULT_PASS,
      }
      const user2 = {
        username: 'sendReceive2',
        pass: DEFAULT_PASS,
      }
      await client1.getUserService().registerUser(user1.username, user2.pass)
      await client2.getUserService().registerUser(user2.username, user2.pass)
      await client1.getAuthenticationService().login(user1.username, user1.pass)
      await client2.getAuthenticationService().login(user2.username, user2.pass)

      const sentMessage: RejectMessage = {
        contractId: '1',
        messageType: DlcMessageType.Reject,
      }

      const stream = client1.getDlcService().getDlcMessageStream()

      // Let time to the stream to be properly set up.
      await sleep(100)

      await client2.getDlcService().sendDlcMessage(sentMessage, user1.username)
      const generator = stream.listen()
      const message = (await generator.next()).value
      stream.cancel()
      const endMessage = await generator.next()

      if (!message) {
        fail()
      } else {
        expect(message.from).toEqual(user2.username)
        expect(message.payload).toEqual(sentMessage)
        expect(endMessage.done).toBeTruthy()
      }
    })
  })
})
