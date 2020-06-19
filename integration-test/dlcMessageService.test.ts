import { Empty, UserInfo } from '@internal/gen-grpc/user_pb'
import { DEFAULT_PASS, TEST_GRPC_CONFIG } from '../services/server/env'
import { GrpcAuth } from '../src/browser/api/grpc/GrpcAuth'
import { GrpcClient } from '../src/browser/api/grpc/GrpcClient'
import {
  DlcTypedMessage,
  DlcMessageType,
  RejectMessage,
  DlcAbstractMessage,
  AcceptMessage,
  SignMessage,
} from '../src/browser/dlc/models/messages'
import { Semaphore } from 'await-semaphore'

describe('dlc-message-service', () => {
  describe('send-receive', () => {
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
    test('send-receive', async () => {
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

      const messages: DlcAbstractMessage[] = []
      const sentMessage: SignMessage = {
        contractId: '1',
        messageType: DlcMessageType.Sign,
        fundTxSignatures: ['a'],
        cetSignatures: ['a'],
        refundSignature: 'a',
        utxoPublicKeys: ['a'],
      }

      const semaphore = new Semaphore(1)

      const release = await semaphore.acquire()

      client1
        .getDlcService()
        .getDlcMessageStream()
        .on('data', data => {
          console.log(data)
          messages.push(data as DlcAbstractMessage)
          release()
        })
        .on('error', error => console.log(error))
      await client2.getDlcService().sendDlcMessage(sentMessage, user1.username)
      await semaphore.acquire()

      console.log(messages)
      expect(messages.length).toEqual(1)
      expect(messages[0].from).toEqual(user2.username)
      expect(messages[0].payload).toEqual(sentMessage)
    })
  })
})
