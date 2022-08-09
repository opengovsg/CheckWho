import { createContext, useContext } from 'react'

interface NotificationDataContext {
  targetNRIC: string | undefined
  setTargetNRIC: (nric: string | undefined) => void
  msgTemplateKey: string | undefined
  setMsgTemplateKey: (key: string | undefined) => void
}

// specify defaults for notification context
export const NotificationDataContext = createContext<
  NotificationDataContext | undefined
>(undefined)

// convenience notification hook
export const useNotificationData = (): NotificationDataContext => {
  const notificationData = useContext(NotificationDataContext)
  if (!notificationData)
    throw new Error(
      'useNotificationData must be used within an NotificationDataProvider',
    )
  return notificationData
}

export default NotificationDataContext
