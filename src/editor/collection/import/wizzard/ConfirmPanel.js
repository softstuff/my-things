import { Button, makeStyles, TextField } from "@material-ui/core";
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
        <h2>Confirm</h2>

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
        <div>Creating A CSV import</div>
        <ul>
          <li><strong>Expected headers</strong> {state.config.columns.join(" ")}</li>
          <li><strong>Expected delimiter</strong> {state.config.delimiter}</li>
        </ul>

        <p>You can name this import if you like: </p>
        
        <TextField 
          label="Name"
          value={name}
          onChange={handleNameChange}
          />
      </>
    )
  }