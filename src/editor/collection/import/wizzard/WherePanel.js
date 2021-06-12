import { useEffect, useState } from "react";
import MapData from "../../../../imports/MapData";
import { useWizzard } from "./useWizzard";

export const WherePanel = () => {
    

    
    return (
      <>
        <h2>Where</h2>

        <MapFields />

      </>
    );
  }


  const MapFields = ({init}) => {
    const [inputs, setInputs] = useState([]);
    const [outputs, setOutputs] = useState([]);
    const [actions, setActions] = useState([]);
    const [edges, setEdges] = useState([]);
    const [lastElements, setLastElements] = useState([]);
    const [rfInstance, setRfInstance] = useState(null);
    const {state, dispatch} = useWizzard()
    // const {config, setConfig, activeStep} = useImportConfig()
  
    
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
      //  if(JSON.stringify(elements) !== JSON.stringify(state.mapping)) {
      //    console.log("Update mapping, elements:", JSON.stringify(elements), "state.mapping:",JSON.stringify(state.mapping))
      //     dispatch({type: "SET_MAPPING", mapping: elements, isValid: elements !== null})
      //  } {
      //   console.log("mapping has not changed")
      //  }
      }, 2000);
  
      return () => clearInterval(handle);
    }, [rfInstance, lastElements]);

    // useEffect(() => {
    //   console.log("rfInstance is updated to ", rfInstance)
    //   if (rfInstance) {
    //     const elements = rfInstance?.toObject()
    //     dispatch({type: "SET_MAPPING", mapping: elements, isValid: elements !== null})
    //   }
    // }, [rfInstance]);


    useEffect(()=>{
      console.log("State changed, state:", state, "rfInstance", rfInstance)
      if(rfInstance) {
        console.log("Ignore reload")
      } else if (state.mapping) {
        console.log("Update mapping", state.mapping)
        setRfInstance({...state.mapping})
      } else if(state.type === "CSV") {
        console.log("Setup default CSV mapping")
        setInputs(state.config.columns.map( (column, index) => ({id: `in_${index}`, name: column})))
        setOutputs(state.config.columns.map( (column, index) => ({id: `out_${index}`, name: column, required: false})))
        setActions([]);
        setEdges(state.config.columns.map( (column, index) => ({source: `in_${index}`, target: `out_${index}`})))
      }
    }, [state, rfInstance])

    // useEffect(()=>{
    //   console.log(`Mapping step done activeStep ${activeStep} myStep: ${myStep}`)
    //   if( myStep !== activeStep) {
    //     const updatedConfig = {...config, mapper: rfInstance.toObject()}
    //     setConfig(updatedConfig)
    //     console.log("Saved data mapping", updatedConfig)
    //   }
    // },[activeStep])
  
    // useEffect(() => {
      //   console.log('get property for pointer ', config.pointer, "From config ", config)
      //   if(config.pointer) {
  
      // const property = getPropertyFor(config.pointer)
  
      // const attributeNodes = Reflect.ownKeys(property.items.properties).reduce( (nodes, attribute, index) => {
      //   if( property.items.properties[attribute]?.type !== 'array'){
      //     nodes.push({
      //       id: `${index + 1000}`,
      //       required: property.items?.required.includes(attribute) ? 'yes': 'no',
      //       name: attribute})
      //   }
      //   return nodes
      // }, [])
  
      // attributeNodes.unshift({ id: config.collectionPath, name: config.collectionId, key: 'yes', data: {collectionPath: config.collectionPath}})
  
      // const inputNodes = config.structure.columns.map((column,index)=>({id: `${index}`, name: column}))
      // setInputs(inputNodes)
      // setOutputs(attributeNodes)
      // setEdges(guessConnections(inputNodes, attributeNodes))
    //   setInputs([
    //     { id: "1", name: "förnamn" },
    //     { id: "2", name: "efternamn" },
    //     { id: "3", name: "age" },
    //   ]);
    //   setOutputs([
    //     { id: "100", key: "yes", name: "Namn" },
    //     { id: "101", required: "yes", name: "Ålder" },
    //     { id: "102", name: "Kön" },
    //   ]);
    //   setActions([
    //     {
    //       id: "50",
    //       type: "join",
    //       data: { joiner: "-" },
    //       position: { x: 250, y: 75 },
    //     },
    //   ]);
    //   setEdges([
    //     { source: "1", target: "50", targetHandle: "a" },
    //     { source: "2", target: "50", targetHandle: "b" },
    //     { source: "50", target: "100" },
    //     { source: "3", target: "101" },
    //   ]);
  
    //   // setActions([])
    //   //  setEdges([])
  
    //   // onValidation(true)
    //   //   }
    // }, []);
  
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
          outputs={outputs}
          actions={actions}
          edges={edges}
          setRfInstance={setRfInstance}
          
        />
      </>
    );
  };
