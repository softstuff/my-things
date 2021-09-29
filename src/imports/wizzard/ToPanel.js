import { Card, CardContent, Radio, FormControlLabel, makeStyles, Typography, RadioGroup, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

import { useEffect } from "react";
import { useWorkspace } from "../../components/workspace/useWorkspace";
import { useWizzard } from "./useWizzard";
import {useFieldArray, useForm} from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import AttributeEditor from "../../editor/document/AttributeEditor";

const useStyles = makeStyles(() => ({
  container: {},
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

  if (!workspace.collections || workspace.collections.length === 0) {
    return <CreateNewStructure />
  }

  return (
    <>
      Select or create structure
      <div className={classes.container}>
        <Autocomplete
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

const CreateNewStructure = ({}) => {
  const {state, dispatch} = useWizzard()
  const { control, register } = useForm();
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "structure", // unique name for your Field Array
    // keyName: "id", default to "id", you can change the key name
  });

  useEffect(()=>{
    console.log("C", state.how.columns.map(column => ({name: column, type: 'text'})))
    remove()
    append( state.how.columns.map(column => ({name: column, type: 'text'})))
  },[])


  return (<>
    <p>Create a new structure</p>

    {fields.map((field, index) => (
        <div key={field.id}>
        <input
            {...register(`structure.${index}.name`)}
        />

          <input
        {...register(`structure.${index}.type`)}
        />
        </div>
    ))}


    {state.how.columns.map((column, index) => (
      <AttributeEditor key={index} field={column} type={'text'} />
    ))}


    <DevTool control={control} /> {/* set up the dev tool */}

  </>)
}

