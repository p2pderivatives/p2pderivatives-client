import React, { useState, FC } from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/lab/Alert'

type Severity = 'error' | 'warning' | 'success'

interface SnackbarProviderType {
  createSnack: (message: string, severity: string, onClose?: () => void) => void
}

const SnackbarContext = React.createContext({} as SnackbarProviderType)

interface SnackType {
  id: number
  open: boolean
  message: string
  severity: Severity
  onClose?: () => void
}

type LayoutProps = {
  children?: React.ReactNode
}

let uniqueId = 1
export const SnackbarProvider: FC<LayoutProps> = (props: LayoutProps) => {
  const [current, setCurrent] = useState<SnackType | null>(null)
  const [queue, setQueue] = useState<Array<SnackType>>([])

  const createSnack = (
    message: string,
    severityString: string,
    onClose?: () => void
  ): void => {
    const id = uniqueId++
    const open = true
    const severity = severityString as Severity
    const snack: SnackType = { id, message, open, severity, onClose }

    if (current) {
      queue.push(snack)
      setQueue(queue)
    } else {
      setCurrent(snack)
    }
  }

  const handleClose = () => {
    if (current) {
      if (current.onClose) current.onClose()
      setCurrent({ ...current, open: false })
    }
    setTimeout(openNext, 1000)
  }

  const openNext = () => {
    if (queue.length) {
      setCurrent(queue[0])
      setQueue(queue.slice(1))
    } else {
      setCurrent(null)
      setQueue([])
    }
  }

  return (
    <SnackbarContext.Provider value={{ createSnack: createSnack }}>
      {current && (
        <Snackbar
          key={current.id}
          open={current.open}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert severity={current.severity}>{current.message}</Alert>
        </Snackbar>
      )}
      {props.children}
    </SnackbarContext.Provider>
  )
}

export function useSnackbar(): SnackbarProviderType {
  return React.useContext(SnackbarContext)
}

export default SnackbarContext
