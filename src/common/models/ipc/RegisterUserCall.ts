export class RegisterUserCall {
  public readonly password: string
  public readonly name: string

  public constructor(password: string, name: string) {
    this.password = password
    this.name = name
  }
}
