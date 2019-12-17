import { DateTime, Duration } from 'luxon'

export class GrpcAuth {
  public static AuthTokenMeta = 'authorization'

  private _authToken = ''
  private _refreshToken = ''
  private _requested: DateTime | null = null
  private _expiration = 0

  public authorize(
    token: string,
    expiration: number,
    refreshToken: string
  ): void {
    this._authToken = token
    this._refreshToken = refreshToken
    this._expiration = expiration
    this._requested = DateTime.utc()
  }

  public deauthorize(): void {
    this._authToken = ''
    this._refreshToken = ''
    this._expiration = 0
    this._requested = null
  }

  public getAuthToken(): string {
    return this._authToken
  }

  public getRefreshToken(): string {
    return this._refreshToken
  }

  public isExpired(): boolean {
    if (this._requested) {
      const duration = Duration.fromObject({ seconds: this._expiration })
      const expirationDate = this._requested.plus(duration)

      const secondsLeft = expirationDate.diffNow('seconds').seconds
      return secondsLeft < 0
    } else {
      return true
    }
  }
}
