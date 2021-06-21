import React, { useContext } from "react"

export const MapperContext = React.createContext()

export const usePayload = () => {
  const {elements, payload} = useContext(MapperContext)
  return {elements, payload} 
}