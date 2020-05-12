import { User } from '../../common/models/user/User'

export interface UserAPI {
  registerUser(password: string, name: string): Promise<string>
  unregisterUser(): Promise<void>
  getUserList(): Promise<User[]>
}
