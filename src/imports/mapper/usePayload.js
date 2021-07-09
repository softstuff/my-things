import React, { useContext } from "react"

export const PayloadContext = React.createContext()

export const usePayload = () => {
  return useContext(PayloadContext)
}