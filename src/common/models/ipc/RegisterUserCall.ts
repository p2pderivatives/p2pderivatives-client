export class RegisterUserCall {
  public readonly account: string
  public readonly password: string
  public readonly name: string

  public constructor(account: string, password: string, name: string) {
    this.account = account
    this.password = password
    this.name = name
  }
}
