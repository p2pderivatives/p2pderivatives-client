import { DateTime } from 'luxon'

export class GrpcAuth {
  public static AuthTokenMeta = 'authorization'

  private _username = ''
  private _authToken = ''
  private _refreshToken = ''
  private _expires: DateTime | null = null

  public authorize(
    token: string,
    expiration: number,
    refreshToken: string
  ): void {
    this._authToken = token
    this._refreshToken = refreshToken
    this._expires = DateTime.utc().plus({ seconds: expiration })
  }

  public deauthorize(): void {
    this._username = ''
    this._authToken = ''
    this._refreshToken = ''
    this._expires = null
  }

  public setUsername(username: string): void {
    this._username = username
  }

  public getUsername(): string {
    return this._username
  }

  public getAuthToken(): string {
    return this._authToken
  }

  public getRefreshToken(): string {
    return this._refreshToken
  }

  public isExpired(): boolean {
    if (this._expires) {
      const secondsLeft = this._expires.diffNow('seconds').seconds
      return secondsLeft <= 0
    } else {
      return true
    }
  }
}
