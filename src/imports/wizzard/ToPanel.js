import { Card, CardContent, Radio, FormControlLabel, makeStyles, Typography, RadioGroup, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

import { useEffect } from "react";
import { useWorkspace } from "../../components/workspace/useWorkspace";
import { useWizzard } from "./useWizzard";

const useStyles = makeStyles(() => ({
  containerXX: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    minHeight: "40vh",
  }
}))

export function ToPanel() {
  const classes = useStyles()
  const {state, dispatch} = useWizzard()
  const {workspace} = useWorkspace()

  // useEffect(()=>{
  //   dispatch({type: "SET_TYPE", value: state.type, isValid: state.type !== null})
  // },[dispatch, state.type])

  // const handleChangeType = event => {
  //   console.log("handleChangeType ", event.target.name, event.target.value, event.target.checked)
  //   const newType = event.target.value
  //   dispatch({type: "SET_TYPE", value: newType, isValid: state.type !== null})
  // }

  const handleStructureSelect = name => {
    const create = !workspace.collections.includes(name)
    let properties = []
    if (create && state.type === "CSV") {
      properties = state.config.columns.map( name => ({ name, type:"text" }))
    }

    dispatch({type: "SET_STRUCTURE", payload: {name, create, properties}})
  }

  return (
    <>
      Select or create structure
      <div className={classes.container}>
        <Autocomplete
          freeSolo
          options={workspace?.collections}
          renderInput={(params) => (
            <TextField {...params} label="Structure name" margin="normal" variant="outlined" />
          )}
          onChange={(_,value) => handleStructureSelect(value)}
          value={state.structure?.name}
        />

        {state.structure?.name && (<p>Nice lets {state.structure?.create ? "create a new": "use"} structure {state.structure?.name}</p>)}

        

      </div>
    </>
  );
}

