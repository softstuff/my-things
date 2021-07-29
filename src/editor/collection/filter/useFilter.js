import { createContext, useCallback, useContext, useReducer } from "react";
import { filterReducer, initialState } from "./filterReducer";

const FilterContext = createContext()



export function FilterProvider({children}) {
    const [state, dispatch] = useReducer(filterReducer, initialState);

    const setSuggestedProperties = useCallback( propertyNames => {
        dispatch({ type: "SUGGESTED_PROPERTIES_NAMES", payload: propertyNames })
    }, [])

    const createFilter = useCallback( filter => {
        dispatch({ type: "CREATE_FILTER", payload: filter })
    }, [])

    const addFilter = useCallback( filter => {
        dispatch({ type: "ADD_FILTER", payload: filter })
    }, [])

    const removeFilter = useCallback( index => {
        dispatch({ type: "REMOVE_FILTER", payload: index })
    }, [])

    const toggleSortDirection = useCallback( () => {
        dispatch({ type: "TOGGEL_ORDER_BY_DIRECTION" })
    }, [])

    const setOrderByProperty = useCallback( (property) => {
        dispatch({ type: "ORDER_BY_PROPERTY_CHANGE", payload: property })
    }, [])

    
    return (
    <FilterContext.Provider value={{state, setSuggestedProperties, createFilter, addFilter, removeFilter, toggleSortDirection, setOrderByProperty}} >
        {children}
    </FilterContext.Provider>)
}

export const useFilter = () => {
    return useContext(FilterContext)
}