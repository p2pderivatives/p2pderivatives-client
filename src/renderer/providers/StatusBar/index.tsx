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
    try {
      return await props.userFn()
    } catch {
      return 'N/A'
    }
  }

  const getBalance = async (): Promise<number> => {
    try {
      return await props.balanceFn()
    } catch {
      return NaN
    }
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
