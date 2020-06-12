import React, { FC } from 'react'

interface UserProviderType {
  getUser: () => Promise<string>
}

const UserContext = React.createContext({} as UserProviderType)

type ProviderProps = {
  userFn: () => Promise<string>
  children?: React.ReactNode
}

export const UserProvider: FC<ProviderProps> = (props: ProviderProps) => {
  const getUser = async (): Promise<string> => {
    return await props.userFn()
  }

  return (
    <UserContext.Provider value={{ getUser: getUser }}>
      {props.children}
    </UserContext.Provider>
  )
}

export function useUserContext(): UserProviderType {
  return React.useContext(UserContext)
}

export default UserContext
