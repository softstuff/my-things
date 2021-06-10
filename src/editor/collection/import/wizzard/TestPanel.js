import { useEffect, useState } from "react";
import { useWizzard } from "./useWizzard";

export const TestPanel = () => {
    const {state, dispatch} = useWizzard()
    const [input, setInput] = useState()
    const [elements, setElements] = useState()
    const [inputNodes, setInputNodes] = useState()
    const [outputNodes, setOutputNodes] = useState()
    const [edgeSource, setEdgeSource] = useState()
    // const [output, setOutput] = useState()
    useEffect(()=>{
      setInput(
        "firstname;lastname\n"+
        "Foo;Bar"
        // "Kalle;Anka"
        )
      
        const el = state.mapping.elements
        .reduce((map, element) => {
          map[element.id] = element;
          return map;
        }, {});
      const inp = state.mapping.elements
            .filter(e => e.type === "input")
            .reduce((map, element) => {
              map[element.data.label] = element;
              return map;
            }, {});
            
      const _edgeSource = state.mapping.elements
            .filter(e => e.source)
            .reduce((map, edge) => {
              map[edge.source] = edge
              return map;
            }, {});

      const outp = state.mapping.elements.filter(e => e.type === "output").map(element => ({[element.id]: element}))
      setElements(el)
      setInputNodes(inp)
      setOutputNodes(outp)
      setEdgeSource(_edgeSource)
      
      console.log("elements", el)
      console.log("inputNodes", inp)
      console.log("inputNoutputNodesodes", outp)

    }, [state])

    useEffect(()=>{

    }, [input])

    const process = (payload) => {
      console.log("process ", payload)
      const out = Object.keys(payload).map((key, index) => {
        const value = payload[key]
        const inputNode = inputNodes[key]
        return pushIt(inputNode, value, payload)
      })
      return out
    }

    /*
ein_0_out_0: {id: "ein_0_out_0", source: "in_0", target: "out_0", sourceHandle: null, targetHandle: null, …}
ein_1_out_1: {id: "ein_1_out_1", source: "in_1", target: "out_1", sourceHandle: null, targetHandle: null, …}
in_0: {id: "in_0", type: "input", data: {…}, position: {…}, sourcePosition: "right"}
in_1: {id: "in_1", type: "input", data: {…}, position: {…}, sourcePosition: "right"}
out_0: {id: "out_0", type: "argument", data: {…}, position: {…}, targetPosition: "left"}
out_1: {id: "out_1", type: "argument", data: {…}, position: {…}, targetPosition: "left"}
    */
    const pushIt = (element, value, payload) => {
      
      if (element?.type === "input") {
        const edge = edgeSource[element.id]
        const target = elements[edge.target]
        return pushIt(target, value, payload)
      } else if (element?.type === "argument") {
        return {[element.data.name]: value}
      }
    }

    const doTest = () => {
      input.split("\n")
        // .filter((_,i) => state.config.hasHeader ? i > 1 : true)
        .map((row, index)=>{
          const values = row.split(state.config.delimiter)
          const payload = values.reduce((map, value, index) => {
            map[state.config.columns[index]] = value;
            return map;
          }, {});
          const output = process(payload)
          console.log("Result ", payload, output)
      })
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
        <ul>
         
        </ul>
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