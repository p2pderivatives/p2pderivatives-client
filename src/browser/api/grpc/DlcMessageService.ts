import { IUserClient } from '@internal/gen-grpc/user_grpc_pb'
import { DlcTypedMessage } from '../../dlc/models/messages/DlcTypedMessage'
import { promisify } from './grpcPromisify'
import { DlcMessage, Empty } from '@internal/gen-grpc/user_pb'
import { Metadata } from 'grpc'
import { GrpcAuth } from './GrpcAuth'
import { Stream, Readable } from 'stream'
import { DlcAbstractMessage } from '../../dlc/models/messages/DlcAbstractMessage'

export interface DlcMessageServiceApi {
  sendDlcMessage(message: DlcTypedMessage, dest: string): Promise<void>
  getDlcMessageStream(): Readable
}

export class DlcMessageService {
  private readonly _client: IUserClient
  private _auth: GrpcAuth

  constructor(client: IUserClient, auth: GrpcAuth) {
    this._client = client
    this._auth = auth
  }

  public async sendDlcMessage(
    message: DlcTypedMessage,
    dest: string
  ): Promise<void> {
    const payload = new Uint8Array(
      new TextEncoder().encode(JSON.stringify(message))
    )
    console.log(typeof payload)
    console.log(payload)
    const dlcMessage = new DlcMessage()
    dlcMessage.setDestName(dest)
    dlcMessage.setPayload(payload)
    const metaData = new Metadata()
    metaData.add(GrpcAuth.AuthTokenMeta, this._auth.getAuthToken())

    const sendDlcMessageAsync = promisify<DlcMessage, Empty>(
      this._client.sendDlcMessage.bind(this._client)
    )

    await sendDlcMessageAsync(dlcMessage, metaData)
  }

  public getDlcMessageStream(): Readable {
    const metaData = new Metadata()
    metaData.add(GrpcAuth.AuthTokenMeta, this._auth.getAuthToken())

    const grpcStream = this._client.receiveDlcMessages(new Empty(), metaData)
    const transformStream = new Stream.Transform({
      readableObjectMode: true,
      writableObjectMode: true,
      transform: (chunk: DlcMessage, _, callback) => {
        console.log(chunk)
        const message = JSON.parse(
          new TextDecoder().decode(chunk.getPayload() as Uint8Array)
        )
        const abstractMessage: DlcAbstractMessage = {
          from: chunk.getOrgName(),
          payload: message,
        }
        callback(null, abstractMessage)
      },
    })
    grpcStream.pipe(transformStream)
    return transformStream
  }
}
