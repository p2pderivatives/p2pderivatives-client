import { IUserClient } from './gen/user_grpc_pb'
import { ClientReadableStream, Metadata } from 'grpc'
import {
  UserRegisterRequest,
  UserRegisterResponse,
  UnregisterUserRequest,
  Empty,
  UserInfo,
  UserStatus,
} from './gen/user_pb'
import { promisify } from './grpcPromisify'
import { GrpcAuth } from './GrpcAuth'

export class UserService {
  private _client: IUserClient
  private _auth: GrpcAuth

  public constructor(client: IUserClient, auth: GrpcAuth) {
    this._client = client
    this._auth = auth
  }

  public registerUser(
    account: string,
    name: string,
    password: string
  ): Promise<UserRegisterResponse> {
    const registerRequest = new UserRegisterRequest()
    registerRequest.setAccount(account)
    registerRequest.setPassword(password)
    registerRequest.setName(name)

    const registerAsync = promisify<UserRegisterRequest, UserRegisterResponse>(
      this._client.registerUser.bind(this._client)
    )
    return registerAsync(registerRequest)
  }

  public unregisterUser(): Promise<Empty> {
    const unregisterRequest = new UnregisterUserRequest()
    const metaData = new Metadata()
    metaData.add(GrpcAuth.AuthTokenMeta, this._auth.getAuthToken())

    const unregisterAsync = promisify<UnregisterUserRequest, Empty>(
      this._client.unregisterUser.bind(this._client)
    )
    return unregisterAsync(unregisterRequest, metaData)
  }

  public getUserListStream(): ClientReadableStream<UserInfo> {
    const metaData = new Metadata()
    metaData.add(GrpcAuth.AuthTokenMeta, this._auth.getAuthToken())

    return this._client.getUserList(new Empty(), metaData)
  }

  public getUserStatusesStream(): ClientReadableStream<UserStatus> {
    const metaData = new Metadata()
    metaData.add(GrpcAuth.AuthTokenMeta, this._auth.getAuthToken())

    return this._client.getUserStatuses(new Empty(), metaData)
  }
}
