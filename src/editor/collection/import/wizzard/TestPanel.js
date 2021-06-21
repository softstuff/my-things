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
    const [input, setInput] = useState(`${state.config.columns.join(state.config.delimiter)}\nKalle;Anka`)
    const [rfInstance, setRfInstance] = useState(null);
    const [initElements, setInitElements] = useState([]);
    const [payload, setPayload] = useState();
    const [result, setResult] = useState();

    useEffect(()=>{
      console.log("update state", state)
      setInitElements( state.mapping.elements )
    }, [state])

    const handleInputChange = (e) => {
      setInput(e.target.value)
    }
    const doTest = () => {

      console.log("doTest clicked")
      const rows = input.split("\n")
      const register = buildRegistry(state.mapping)

      const _payload = processChunk(rows[1], state.type, state.config, register)
      console.log("Got payload",_payload)
      setPayload(_payload)
      const _result = Object.keys(_payload).filter(name => name.startsWith("out_")).map(key=>{
        return {attribute: register.nodeIdToNode[key].data.label, value: _payload[key]}
      })
      console.log("Got result",_result)
      setResult(_result)
    }

    return (
      <>
        <h2>Test CSV</h2>

        <div>

          <textarea cols={120} rows={10} value={input} onChange={handleInputChange} />
        </div>
        <div>
          <button onClick={doTest}>Test</button>
        </div>
        {result && (
        <div>
          <ul>
            { result.map(item => (
              <li key={item.attribute}>
                {item.attribute}: {item.value}
              </li>
            ))}
          </ul>
        </div>)}
        <div>
          <PayloadContext.Provider value={{payload}}>
            <MapData
              initElements={initElements}
              setRfInstance={setRfInstance} 
              locked={true}        
            />
        </PayloadContext.Provider>
        </div> 
      </>
    )
  }