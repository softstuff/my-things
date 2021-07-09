import React, { useContext, useEffect, useState } from "react"
import {nanoid} from 'nanoid'

export const MapperContext = React.createContext()

export const useMapper = () => {
  return useContext(MapperContext)
}

export const MapperProvider = (props) => {

  const [elements, setElements] = useState(props.initElements);
  const [locked, setLocked] = useState(props.locked);
  const [payload, setPayload] = useState(props.payload);
  const [reactFlowInstance, setReactFlowInstance] = useState();
  const [inputs, setInputs] = useState(props.inputs || []);
  const [unmappedInputs, setUnmappedInputs] = useState([]);
  
  const generateId = () => nanoid(6);

  useEffect(()=>{
    setElements(props.initElements)
  }, [props.initElements])

  useEffect(()=>{
    setLocked(props.locked)
  }, [props.locked])

  useEffect(()=>{
    setPayload(props.payload)
  }, [props.payload])

  useEffect(()=>{
    const unmapped = props.inputs?.filter(input => !elements.some(el => el.type === 'input' && el.data.label === input))
    console.log("unmapped", unmapped, "of", inputs, "elements", elements)
    setUnmappedInputs(unmapped)
    setInputs(props.inputs)
  }, [props.inputs, elements, inputs])

  return (
    <MapperContext.Provider  value={{
        elements, setElements,
        payload, setPayload,
        locked, setLocked,
        unmappedInputs,
        reactFlowInstance, setReactFlowInstance, 
        generateId}}>
      {props.children}
    </MapperContext.Provider>)
}