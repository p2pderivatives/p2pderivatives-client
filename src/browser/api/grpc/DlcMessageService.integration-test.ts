import getMockServer from '../../../../__mocks__/grpcUserMockServer'
import { GrpcClient } from './GrpcClient'
import { GrpcConfig } from './GrpcConfig'
import { GrpcAuth } from './GrpcAuth'
import { OfferMessage } from '../../dlc/models/OfferMessage'
import Amount from '../../../common/models/dlc/Amount'
import {
  DlcMessageType,
  DlcTypedMessage,
} from '../../dlc/models/DlcTypedMessage'
import msgpack from 'msgpack'
import { DlcMessage } from '@internal/gen-grpc/user_pb'
import { DateTime } from 'luxon'
import { PartyInputs } from '../../dlc/models/PartyInputs'

const port = '50052'
const offerMessages = createOfferMessages(3)
const serOfferMessages = offerMessages.map(m => {
  return {
    output: createDlcMessage(m),
  }
})
const mockServer = getMockServer(serOfferMessages)
const config: GrpcConfig = { host: '127.0.0.1:' + port, secure: false }
const auth = new GrpcAuth()
const client = new GrpcClient(config, auth)

function createDlcMessage(unserMessage: DlcTypedMessage) {
  const serMessage = msgpack.pack(unserMessage)
  const dlcMessage = new DlcMessage()
  dlcMessage.setOrgName('alice')
  dlcMessage.setDestName('bob')
  dlcMessage.setPayload(serMessage)
  return dlcMessage.toObject()
}

function createOfferMessages(nb: number): OfferMessage[] {
  let offerMessages: OfferMessage[] = []
  for (let i = 0; i < nb; i++) {
    offerMessages.push(createOfferMessage(i))
  }

  return offerMessages
}

function createOfferMessage(id: number): OfferMessage {
  return {
    contractId: id.toString(),
    localCollateral: Amount.FromBitcoin(1),
    remoteCollateral: Amount.FromBitcoin(1),
    maturityTime: DateTime.utc(2020, 5, 15),
    outcomes: [
      {
        local: Amount.FromBitcoin(1),
        remote: Amount.FromBitcoin(1),
        message: '1',
      },
    ],
    oracleInfo: {
      name: 'Olivia',
      rValue: '1',
      publicKey: '1',
      assetId: 'btcusd',
    },
    localPartyInputs: {
      fundPublicKey: '1',
      sweepPublicKey: '1',
      changeAddress: '1',
      finalAddress: '1',
      utxos: [],
    },
    feeRate: 2,
    premiumInfo: {
      premiumAmount: Amount.FromBitcoin(1),
      localPays: true,
    },
    messageType: DlcMessageType.Offer,
  }
}

describe('dlc-service-integration-tests', () => {
  beforeAll(() => {
    mockServer.listen('0.0.0.0:' + port)
  })

  afterAll(() => {
    mockServer.close(true)
  })

  test('grpc-dlc-send-message', async () => {
    await client.getDlcService().sendDlcMessage(offerMessages[0], 'bob')
  })

  test('grpc-dlc-receive-messages', done => {
    let stream = client.getDlcService().getDlcMessageStream()
    const receivedMessages: DlcTypedMessage[] = []
    stream
      .on('data', (message: DlcTypedMessage) => {
        receivedMessages.push(message)
      })
      .on('error', error => {
        fail(error)
      })
      .on('end', () => {
        for (let i = 0; i < offerMessages.length; i++) {
          expect(receivedMessages[i].contractId).toEqual(
            offerMessages[i].contractId
          )
        }
        done()
      })
  })
})
