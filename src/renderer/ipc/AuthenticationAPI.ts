export interface AuthenticationAPI {
  login(username: string, password: string): Promise<void>
  logout(): Promise<void>
  refresh(): Promise<void>
}
