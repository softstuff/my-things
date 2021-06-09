import { useEffect, useState } from "react";
import { useWizzard } from "./useWizzard";

export const TestPanel = () => {
    const {state, dispatch} = useWizzard()
    const [idToElement, setIdToElement] = useState()
    const [idToInputs, setIdToInputs] = useState()
    const [inputs, setInputs] = useState()
    useEffect(()=>{
      const el = state.mapping.elements.map(element => ({[element.id]: element}))
      const inp = state.mapping.elements.filter(e => e.type === "input").map(element => ({[element.id]: element}))
      setIdToElement(
        el
      )
      setIdToInputs(
        inp
      )
      setInputs(state.mapping.elements.filter(e => e.type === "input"))
      console.log("Loaded", state)
    }, [state])

    return (
      <>
        <h2>Test</h2>

        <ul>
          {inputs && inputs.map(input => 
            <li key={input.id}>
              {input.data.label}
            </li>
          )}
        </ul>
      </>
    );
  }