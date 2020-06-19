import { IPCError } from './IPCError'
import { Contract } from '../dlc/Contract'

export class DlcIPCError extends IPCError {
  constructor(
    type: string,
    code: number,
    message: string,
    name: string,
    private readonly _contract?: Contract
  ) {
    super(type, code, message, name)
  }

  getContract() {
    return this._contract
  }
}
