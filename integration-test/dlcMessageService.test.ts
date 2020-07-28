import { DEFAULT_PASS, TEST_GRPC_CONFIG } from '../services/server/env'
import { GrpcAuth } from '../src/browser/api/grpc/GrpcAuth'
import { GrpcClient } from '../src/browser/api/grpc/GrpcClient'
import {
  DlcMessageType,
  RejectMessage,
  DlcAbstractMessage,
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
      await client1.getUserService().registerUser(user1.username, user1.pass)
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
  describe('ping or invalid ignored', () => {
    test('no error', async () => {
      const user3 = {
        username: 'pingignore',
        pass: DEFAULT_PASS,
      }
      const user4 = {
        username: 'pingignore2',
        pass: DEFAULT_PASS,
      }
      const auth3 = new GrpcAuth()
      const client3 = new GrpcClient(TEST_GRPC_CONFIG, auth3)
      const auth4 = new GrpcAuth()
      const client4 = new GrpcClient(TEST_GRPC_CONFIG, auth4)
      await client3.getUserService().registerUser(user3.username, user3.pass)
      await client4.getUserService().registerUser(user4.username, user4.pass)
      await client3.getAuthenticationService().login(user3.username, user3.pass)
      await client4.getAuthenticationService().login(user4.username, user4.pass)

      const stream = client3.getDlcService().getDlcMessageStream()
      const generator = stream.listen()

      // Let time to the stream to be properly set up.
      await sleep(100)

      const conStream = client4.getUserService().getConnectedUsers()

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _ of conStream) {
        // consume the stream
      }

      let message: DlcAbstractMessage | void | undefined = undefined

      const getMessagePromise = (async (): Promise<void> => {
        message = (await generator.next()).value
      })()

      await Promise.race([
        getMessagePromise,
        new Promise(accept =>
          setTimeout(() => {
            accept()
          }, 200)
        ),
      ])

      expect(message).toBeUndefined()

      stream.cancel()
      await getMessagePromise
    })
  })
})
