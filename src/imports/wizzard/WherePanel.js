import { useCallback, useEffect, useState } from "react";
import MapData from "..//mapper/MapData";
import { useWizzard } from "./useWizzard";

export const WherePanel = () => {
    

    
    return (
      <>
        <MapFields />
       </>
    );
  }


  const MapFields = () => {
    const [inputs, setInputs] = useState([]);
    const [initElements, setInitElements] = useState([]);
    const {state, dispatch} = useWizzard()
  
    // const getInputs = () => {
    //   if(state.type === "CSV") return state.config.columns
    // }

    useEffect(()=>{
      setInputs(state.config.columns)
      console.log("State changed, state:", state)
      if (state.mapping?.elements?.length > 0) {
        console.log("Update mapping", state.mapping)
        setInitElements( [...state.mapping.elements])
      } else if(state.type === "CSV") {
        console.log("Setup default CSV mapping")
        const elle = [
          ...state.config.columns.map( (column, index) => ({id: `in_${index}`, type: "input", data: { label: column}, sourcePosition: "right", position: { x: 0, y: index * 80 + 20 }})),
          ...state.config.columns.map( (column, index) => ({id: `out_${index}`, data: { label: column}, type: "attribute", targetPosition: "left", position: { x: 300, y: index * 60 + 20 }})),
          ...state.config.columns.map( (column, index) => ({id: `e_in_${index}_to_out_${index}`, source: `in_${index}`, target: `out_${index}`, type: 'custom'})),
          { id: "structure", type: "structure", data: {label: state.structure.name, properties: state.structure.properties }, position: { x: 600, y: 80 }}
        ]
        console.log("elle", elle)
        setInitElements( elle)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    
    const onElementsUpdate = useCallback( elements => {
      const inputs = state.config.columns
      const isValid = !elements.some(el => el.data?.isValid === false)
      const hasChanged = JSON.stringify(state.mapping) === JSON.stringify({elements, inputs})
      console.log("Elements has updated", "hasChanged", hasChanged, "isValid", isValid)
      // if (hasChanged) {
        dispatch({type: "SET_MAPPING", mapping: {elements, inputs}, isValid})
      // }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [state.config.columns])
  
    // const guessConnections = (inputNodes, argumentNodes) => {
    //   let connections = inputNodes
    //     .map((inputNode) => {
    //       const arg = argumentNodes.find((arg) => arg.name === inputNode.name);
    //       if (arg) {
    //         return { source: inputNode.id, target: arg.id };
    //       } else {
    //         return null;
    //       }
    //     })
    //     .filter((conn) => conn !== null);
  
    //   return connections;
    // };
  
    return (
      <>
        <MapData
          inputs={inputs}
          initElements={initElements}
          onElementsUpdate={onElementsUpdate} 
        />
      </>
    );
  };
