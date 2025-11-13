"use client"

import { createContext, useContext } from "react"

export const NotificationContext = createContext()

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within NotificationContext.Provider")
  }
  return context
}
