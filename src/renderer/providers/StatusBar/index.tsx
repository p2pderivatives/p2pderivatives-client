import React, { FC } from 'react'

interface StatusBarProviderType {
  getUser: () => Promise<string>
  getBalance: () => Promise<number>
}

const StatusBarContext = React.createContext({} as StatusBarProviderType)

type ProviderProps = {
  userFn: () => Promise<string>
  balanceFn: () => Promise<number>
  children?: React.ReactNode
}

export const StatusBarProvider: FC<ProviderProps> = (props: ProviderProps) => {
  const getUser = async (): Promise<string> => {
    return await props.userFn()
  }

  const getBalance = async (): Promise<number> => {
    return await props.balanceFn()
  }

  return (
    <StatusBarContext.Provider
      value={{ getUser: getUser, getBalance: getBalance }}
    >
      {props.children}
    </StatusBarContext.Provider>
  )
}

export function useStatusBarContext(): StatusBarProviderType {
  return React.useContext(StatusBarContext)
}

export default StatusBarContext
