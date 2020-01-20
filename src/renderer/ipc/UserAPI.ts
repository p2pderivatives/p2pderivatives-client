export interface UserAPI {
  registerUser(password: string, name: string): Promise<string>
  unregisterUser(): Promise<void>
}
