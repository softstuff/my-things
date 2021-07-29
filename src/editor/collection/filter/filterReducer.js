export const initialState = {
    filterType: "none",
    filters: [],
    propertyNames: [],
    orderByProperty: "",
    orderByDirection: "asc",
    sortablePropertys: [],
    selectableOperators: ["<", "<=", "==", "!=", ">=", ">"], // , "array-contains", "in", "array-contains-any", "not-in"
    canAddAttribute: true
}

const createFilterAction = (state, payload) => {
    const filters = [{property: payload.property, operator: payload.operator, value: payload.value}]

    if(payload.operator === "==" || payload.operator === "!="){
        return {
            ...state,
            filters,
            filterType: "exact",
            selectableOperators: ["==", "!="],
            canAddProperty: true,
            sortablePropertys: [],
            orderByProperty: ""
        }
    }
    else if(payload.operator.includes("<") || payload.operator.includes(">")){
        return {
            ...state,
            filters,
            filterType: "range", 
            selectableOperators: ["<", "<=", "==", "!=", ">=", ">"], 
            propertyNames: [payload.property],
            sortablePropertys: [payload.property],
            canAddProperty: false, 
            orderByProperty: payload.property,
            orderByDirection: "asc" 
        }
    } else {
        return {
            ...state,
            filters,
            filterType: "array", selectableOperators: ["array-contains", "in", "array-contains-any", "not-in"]
        }
    }
}

const addFilterAction = (state, payload) => {
    let newState = {...state}

    if (state.filters.length === 0) {
        newState = createFilterAction(state, payload)
    }
    return {
        ...newState,
        filters: [...state.filters, payload],
    }
}

const removeFilterAction = (state, index) => {
    const filters = [...state.filters.slice(0, index), ...state.filters.slice(index+1)]
    if (filters.length === 0) {
        return {
            ...initialState,
            allPropertyNames: state.allPropertyNames,
            propertyNames: state.allPropertyNames,
            sortablePropertys: state.allPropertyNames,
            }
    }
    return { ...state, filters }
}

export function filterReducer(state, action) {
    switch (action.type) {
      case "SUGGESTED_PROPERTIES_NAMES":
        return {
          ...state,
          allPropertyNames: action.payload,
          propertyNames: action.payload,
          sortablePropertys: action.payload,
          orderByDirection: "asc"
        };
        case "ORDER_BY_PROPERTY_CHANGE":
            return {
              ...state,
              orderByProperty: action.payload
            };
        case "TOGGEL_ORDER_BY_DIRECTION":
            return {
                ...state,
                orderByDirection: state.orderByDirection === "asc" ? "desc" : "asc"
            };
        case "ADD_FILTER":
            return addFilterAction(state, action.payload)
        case "REMOVE_FILTER":
            return removeFilterAction(state, action.payload)
            
      default: throw new Error("Unsupported action type" + action.type)
    }
  }