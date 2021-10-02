import {
  Card,
  CardContent,
  Radio,
  FormControlLabel,
  Typography,
  RadioGroup,
  TextField,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import Autocomplete from '@mui/material/Autocomplete';

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
  const {state} = useWizzard()
  const { control, register, handleSubmit } = useForm();
  const { fields, replace, append, remove, move} = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "fields", // unique name for your Field Array
    // keyName: "id", default to "id", you can change the key name
  });

  useEffect(()=>{
    console.log("Load columns", state.how.columns.map(column => ({name: column, type: 'text'})))

    replace( state.how.columns.map(column => ({name: column, type: 'text'})))
  },[])

  const createStructure = structur => {
    console.log("Create structure", structur)
  }

  return (<>
    <p>Create a new structure</p>

    <form onSubmit={handleSubmit(createStructure)}>
    <input
        {...register(`name`)}
    />


    {fields.map((field, index) => (
        <div key={field.id}>
        <input
            {...register(`fields.${index}.name`)}
        />

          <input type="hidden"
        {...register(`fields.${index}.type`)}
        />

          <button onClick={()=>move(index,index-1)} disabled={index === 0}>Up</button>
          <button onClick={()=>move(index, index+1)} disabled={index+1 === fields.length} >Down</button>
          <button onClick={()=>remove(index)} >Remove</button>
        </div>
    ))}

    <div>
      <button onClick={()=>append({name:"", type: "text"})} >Add</button>
    </div>


    <div>
      <button type="submit" >Create structure</button>
    </div>

    </form>

    {/*<DevTool control={control} /> /!* set up the dev tool *!/*/}

  </>)
}

