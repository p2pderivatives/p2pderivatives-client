import React, { FC } from 'react'

type LayoutProps = {
  children?: React.ReactNode
}

const Root: FC<LayoutProps> = (props: LayoutProps) => {
  return <div>{props.children}</div>
}

export default Root
