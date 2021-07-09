import { createContext, useContext, useReducer } from "react";
import { wizardReducer } from "./wizardReducer";


const WizzardContext = createContext()

const initialState = {
    step: {
      active: 0,
      canBack: false,
      hasNext: true,
    },
    type: 'CSV',
    // config: {}
  };

export function WizzardProvider({children}) {
    const [state, dispatch] = useReducer(wizardReducer, initialState);
    return (
    <WizzardContext.Provider value={{state, dispatch}} >
        {children}
    </WizzardContext.Provider>)
}

export const useWizzard = () => {
    return useContext(WizzardContext)
}