export interface AuthenticationAPI {
  login(username: string, password: string): Promise<void>
  logout(): Promise<void>
  refresh(): Promise<void>
  changePassword(oldPassword: string, newPassword: string): Promise<void>
  getUser(): Promise<string>
}
