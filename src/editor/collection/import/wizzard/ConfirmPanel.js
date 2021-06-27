import { Box, Button, makeStyles, TextField } from "@material-ui/core";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useEditor } from "../../../useEditor";
import { useWizzard } from "./useWizzard";


const useStyles = makeStyles((theme) => ({
  content: {
    minHeight: "20rem"
  }
}))

export const ConfirmPanel = () => {
    const {state} = useWizzard()
    const classes = useStyles()
    return (
      <>
        <div className={classes.content}>
        {state.type === "CSV" && (<CsvConfirm />)}
        </div>
      </>
    );
  }

  const CsvConfirm = () => {
    const {state, dispatch} = useWizzard()
    const {collectionId} = useEditor()
    const [name, setName] = useState("")

    useEffect(()=>{
      dispatch({type: "CONFIRMED", name, collectionId,  isValid: true})
    },[name])
    
    const handleNameChange = e => {
      setName( e.target.value)
    }

    return (
      <>
        <p>You can name this import if you like: </p>
          
        <TextField 
          label="Name"
          value={name}
          onChange={handleNameChange}
          />

        <Box m={5} />

        <p>Creating A CSV import</p>
        <ul>
          <li><strong>Expects {state.config.columns.length} columns:</strong> {state.config.columns.join(", ")}</li>
          <li><strong>Expected separator</strong> {state.config.separator}</li>
          <li><strong>Expected file encoding</strong> {state.config.encoding}</li>
          <li><strong>Expected file extentions</strong> {state.config.extentions.join(", ")}</li>
        </ul>

        
      </>
    )
  }