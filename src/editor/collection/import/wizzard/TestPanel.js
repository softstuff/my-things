import { useEffect, useState } from "react";
import MapData from "../../../../imports/mapper/MapData";
import { useWizzard } from "./useWizzard";

export const TestPanel = () => {
    const [input, setInput] = useState()
    const {state, dispatch} = useWizzard()
    const [rfInstance, setRfInstance] = useState(null);
    const [initElements, setInitElements] = useState([]);

    // useEffect(()=>{
    //   if (!setRfInstance || !state?.mapping) return

    //   console.log("update mappings ",setRfInstance, state?.mapping)
    //   // setRfInstance({...state.mapping})
    // }, [state, setRfInstance])

    useEffect(()=>{
      console.log("update state", state)
      setInitElements( state.mapping.elements )
    }, [state])

    // useEffect(()=>{
    //   console.log("update setRfInstance", setRfInstance)
    // }, [setRfInstance])

    const doTest = () => {
      console.log("doTest clicked")
    }
    return (
      <>
        <h2>Test</h2>

        <div>
          <textarea cols={120} rows={10} value={input} onChange={(e)=>setInput(e.target.value)} />
        </div>
        <div>
          <button onClick={doTest}>Test</button>
        </div>
          
        <div>
        <MapData
          initElements={initElements}
          setRfInstance={setRfInstance} 
          locked={true}        
        />
        </div>
      </>
      
    );
  } 
  // {output && output.map(output => 
  //   <li key={output.id}>
  //     <pre>
  //       {JSON.stringify(output, null, 2)}
  //     </pre>
  //   </li>
  // )}