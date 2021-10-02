import { Card, CardContent, Radio, FormControlLabel, Typography, RadioGroup } from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

import { useEffect } from "react";
import { useWizzard } from "./useWizzard";

const useStyles = makeStyles(() => ({
  types: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    minHeight: "40vh",
  }
}))

export function WhatPanel() {
  const classes = useStyles()
  const {state, dispatch} = useWizzard()

  useEffect(()=>{
    dispatch({type: "SET_TYPE", value: state.type, isValid: state.type !== null})
  },[dispatch, state.type])

  const handleChangeType = event => {
    console.log("handleChangeType ", event.target.name, event.target.value, event.target.checked)
    const newType = event.target.value
    dispatch({type: "SET_TYPE", value: newType, isValid: state.type !== null})
  }
  return (
    <>
      <div>
        <RadioGroup className={classes.types} aria-label="type" name="type" value={state.type} onChange={handleChangeType}>
          <TypeCard type={"CSV"} />
          <TypeCard type={"JSON"} disabled={true} />
          <TypeCard type={"XML"} disabled={true} />
          <TypeCard type={"YAML"} disabled={true} />
        </RadioGroup>
      </div>
    </>
  );
}

const TypeCard = ({type, disabled}) => {
  
  return (
    <Card variant="outlined">
    <CardContent>
      
      <FormControlLabel 
       label={
          <Typography variant="h5" component="h2">
            {type}
          </Typography>
        }
        labelPlacement="top"  
        value={type}
        disabled={disabled}
        control={
          <Radio
            color="primary"
        />}
      />
    </CardContent>
    </Card>)
}
