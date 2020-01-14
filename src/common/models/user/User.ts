export interface UserProps {
  _name: string
}

export class User implements UserProps {
  readonly _name: string

  constructor(name: string) {
    this._name = name
  }

  public getName(): string {
    return this._name
  }

  public static parse(json: UserProps): User {
    return new User(json._name)
  }
}
