import { Button, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import MapData from "../../../../imports/mapper/MapData";
import { PayloadContext } from "../../../../imports/mapper/usePayload";
import { buildRegistry, processChunk } from "../importer";
import { useWizzard } from "./useWizzard";


export const TestPanel = () => {
    const {state} = useWizzard()

    return (
      <>
        {state.type === "CSV" && (<CsvTest />)}
      </>
      
    );
  } 


  const CsvTest = () => {
    const {state, dispatch} = useWizzard()
    const [source, setSource] = useState(`${state.config.columns.join(state.config.delimiter)}\nKalle;Anka`)
    const [payload, setPayload] = useState();
    const [chunks, setChunks] = useState([]);
    const [register, setRegister] = useState()
    const [rows, setRows] = useState([])

    useEffect(()=>{
      setRegister(buildRegistry(state.mapping))
      dispatch({type: "TESTED", isValid: true})
    }, [state.mapping])
    
    useEffect(()=>{
      const _rows = source.split("\n")
      if(_rows.length > 0 && _rows[0].startsWith(state.mapping.inputs[0])){
        _rows.shift()
      }
      setRows(_rows.slice(0, 20))
    }, [source])
    

    const handleSourceChange = (e) => {
      e.preventDefault()
      setSource(e.target.value)
    }

    const doTest = () => {

      console.log("doTest clicked", rows)
      const _chunks = rows.map(source => {
        const _payload = processChunk(source, state.type, state.config, register)
        console.log("Got payload",_payload)
        
        const attributes = Object.keys(_payload)
            .filter(name => name.startsWith("out_"))
            .map(key=>(
              {name: register.nodeIdToNode[key].data.label, value: _payload[key]}
            ))
        return {source, attributes, payload: _payload}   
      })
      setChunks(_chunks)
    }


    return (
      <>
        <h2>Test CSV</h2>

        <div>
          <textarea cols={120} rows={10} value={source} onChange={handleSourceChange} />
        </div>
        <div>
          <button onClick={doTest}>Test</button>
        </div>

        <div>
          Result
          <ol>
            {chunks.map((chunk, index) => (
              <li key={index}>
                <a onClick={()=>setPayload(chunk.payload)} >{chunk.source}</a>
                {chunk.attributes.map(attribute => (
                  <div>{attribute.name}: {attribute.value}</div>
                ))}
              </li>
            ))}
          </ol>
        </div>
        
        <div>
          <PayloadContext.Provider value={{payload}}>
            <MapData
              initElements={state.mapping.elements}
              locked={true}
              payload={payload}
            />
        </PayloadContext.Provider>
        </div> 
      </>
    )
  }