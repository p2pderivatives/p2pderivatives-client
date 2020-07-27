import { IUserClient } from '@internal/gen-grpc/user_grpc_pb'
import { DlcMessage, Empty } from '@internal/gen-grpc/user_pb'
import { Metadata } from 'grpc'
import { DlcAbstractMessage } from '../../dlc/models/messages/DlcAbstractMessage'
import { DlcTypedMessage } from '../../dlc/models/messages/DlcTypedMessage'
import { GrpcAuth } from './GrpcAuth'
import { promisify } from './grpcPromisify'
import { Readable } from 'stream'
import { AuthenticationService } from './AuthenticationService'

export interface DlcMessageServiceApi {
  sendDlcMessage(message: DlcTypedMessage, dest: string): Promise<void>
  getDlcMessageStream(): DlcMessageStream
}

export class DlcMessageStream {
  constructor(
    private readonly grpcStream: Readable,
    private readonly authService: AuthenticationService,
    readonly cancel: () => void
  ) {}

  async *listen(): AsyncGenerator<DlcAbstractMessage, void, unknown> {
    try {
      await this.authService.refresh()
      for await (const chunk of this.grpcStream) {
        const payload = chunk.getPayload()
        // ignore ping or invalid messages
        if (typeof payload === 'string') {
          continue
        }
        const message = JSON.parse(
          new TextDecoder().decode(payload as Uint8Array)
        )
        const abstractMessage: DlcAbstractMessage = {
          from: chunk.getOrgName(),
          payload: message,
        }

        // ignore ping or invalid messages
        if (
          abstractMessage.from === '' ||
          Object.keys(abstractMessage.payload).length === 0
        ) {
          continue
        }
        yield abstractMessage
      }
    } catch (error) {
      // Stream was cancelled
      if (error.code === 1) {
        return
      }

      throw error
    }
  }
}

export class DlcMessageService implements DlcMessageService {
  private readonly _client: IUserClient
  private readonly _authService: AuthenticationService

  constructor(client: IUserClient, authService: AuthenticationService) {
    this._client = client
    this._authService = authService
  }

  public async sendDlcMessage(
    message: DlcTypedMessage,
    dest: string
  ): Promise<void> {
    await this._authService.refresh()
    const payload = new Uint8Array(
      new TextEncoder().encode(JSON.stringify(message))
    )
    const dlcMessage = new DlcMessage()
    dlcMessage.setDestName(dest)
    dlcMessage.setPayload(payload)
    const metaData = new Metadata()
    metaData.add(
      GrpcAuth.AuthTokenMeta,
      this._authService.getGrpcAuth().getAuthToken()
    )

    const sendDlcMessageAsync = promisify<DlcMessage, Empty>(
      this._client.sendDlcMessage.bind(this._client)
    )

    await sendDlcMessageAsync(dlcMessage, metaData)
  }

  public getDlcMessageStream(): DlcMessageStream {
    const metaData = new Metadata()
    metaData.add(
      GrpcAuth.AuthTokenMeta,
      this._authService.getGrpcAuth().getAuthToken()
    )

    const grpcStream = this._client.receiveDlcMessages(new Empty(), metaData)

    return new DlcMessageStream(grpcStream, this._authService, () =>
      grpcStream.cancel()
    )
  }
}
