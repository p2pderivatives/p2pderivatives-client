// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPCErrorProps {
  _code: number
  _message: string
  _name: string
}

export class IPCError {
  private readonly _code: number
  private readonly _message: string
  private readonly _name: string

  constructor(code: number, message: string, name: string) {
    this._code = code
    this._message = message
    this._name = name
  }

  public getCode(): number {
    return this._code
  }

  public getMessage(): string {
    return this._message
  }

  public getName(): string {
    return this._name
  }

  public static parse(json: IPCErrorProps): IPCError {
    return new IPCError(json._code, json._message, json._name)
  }
}
