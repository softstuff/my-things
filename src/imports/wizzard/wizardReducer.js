
export function wizardReducer(state, action) {
    console.log("state", state, "action", action)
    switch (action.type) {
      case "BACK":
        return {
          ...state,
          step: {
            ...state.step,
            active: state.step.active - 1,
            canBack: state.step.active - 1 > 0,
            hasNext: true,
          },
        };
      case "NEXT":
        return {
          ...state,
          step: {
            ...state.step,
            active: state.step.active + 1,
            canBack: true,
            hasNext: state.step.active + 1 < 4,
          },
        };
      case "SET_TYPE": {
        return {
          ...state,
          type: action.value,
          step: {
              ...state.step,
              [`done_${state.step.active}`]: action.isValid
          }
        }
      }
      case "SET_CONFIG": {
        return  {
          ...state,
          step: {
            ...state.step,
            [`done_${state.step.active}`]: action.isValid
          },
          config: action.values,
        };
      }
      case "SET_MAPPING": {
        return  {
          ...state,
          step: {
            ...state.step,
            [`done_${state.step.active}`]: action.isValid
          },
          mapping: action.mapping,
        };
      }
      case "TESTED": {
        return  {
          ...state,
          step: {
            ...state.step,
            [`done_${state.step.active}`]: action.isValid
          },
        };
      }
      case "CONFIRMED": {
        return  {
          ...state,
          step: {
            ...state.step,
            [`done_${state.step.active}`]: action.isValid
          },
          name: action.name || '',
          collectionId: action.collectionId
        };
      }
      default: throw new Error("Unsupported action type" + action.type)
    }
  }