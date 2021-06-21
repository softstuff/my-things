import { useEffect, useState } from "react";
import MapData from "../../../../imports/mapper/MapData";
import { useWizzard } from "./useWizzard";

export const WherePanel = () => {
    

    
    return (
      <>
        <h2>Where</h2>

        <MapFields />

      </>
    );
  }


  const MapFields = () => {
    const [inputs, setInputs] = useState([]);
    const [initElements, setInitElements] = useState([]);
    const [lastElements, setLastElements] = useState([]);
    const [rfInstance, setRfInstance] = useState(null);
    const {state, dispatch} = useWizzard()
  
    
    useEffect(() => {
      const handle = setInterval(() => {
        if(!rfInstance) {
          console.log()
          return
        }
       const elements = {...rfInstance?.toObject()}
       delete elements.position
       delete elements.zoom
       if (JSON.stringify(elements) !== JSON.stringify(lastElements)){
        console.log("Element changed", lastElements === elements, lastElements == elements, JSON.stringify(elements) === JSON.stringify(lastElements))
        setLastElements(elements)
        dispatch({type: "SET_MAPPING", mapping: elements, isValid: elements !== null})
       }
      }, 1000);
  
      return () => clearInterval(handle);
    }, [rfInstance, lastElements]);

    useEffect(() => {
      console.log("rfInstance is updated to ", rfInstance)
    }, [rfInstance]);


    useEffect(()=>{
      setInputs(state.config.columns)

      console.log("State changed, state:", state, "rfInstance", rfInstance)
      if(rfInstance) {
        console.log("Ignore reload")
      } else if (state.mapping) {
        console.log("Update mapping", state.mapping)
        setRfInstance({...state.mapping})
      } else if(state.type === "CSV") {
        console.log("Setup default CSV mapping")
        const elle = [
          ...state.config.columns.map( (column, index) => ({id: `in_${index}`, type: "input", data: { label: column}, sourcePosition: "right", position: { x: 0, y: index * 80 + 20 }})),
          ...state.config.columns.map( (column, index) => ({id: `out_${index}`, data: { label: column}, type: "attribute", targetPosition: "left", position: { x: 500, y: index * 60 + 20 }})),
          ...state.config.columns.map( (column, index) => ({id: `e_in_${index}_to_out_${index}`, source: `in_${index}`, target: `out_${index}`, type: 'custom'}))
        ]
        console.log("elle", elle)
        setInitElements( elle)
        
      }
    }, [state, rfInstance])

  
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
          setRfInstance={setRfInstance}          
        />
      </>
    );
  };
