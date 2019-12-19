export class LoginCall {
  public readonly username: string
  public readonly password: string

  public constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }
}
