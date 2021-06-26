import { Card, CardContent, FormControl, FormControlLabel, FormGroup, FormLabel, makeStyles, Radio, RadioGroup, TextField } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useWizzard } from "./useWizzard";
import isEmpty from 'lodash/isEmpty'

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  columns: {
    display: "flex",
    marginTop: "2rem",
    marginBottom: "3rem"
  },
  column: {
    marginRight: "1rem"
  },
  headers:{
    marginTop: "2rem",
    marginBottom: "3rem"
  }
}))

export function HowPanel() {
  const { state } = useWizzard();
  return (
    <>
      <h2>How</h2>
      {state.type === "CSV" && <CsvConfig />}
    </>
  );
}

const CsvConfig = () => {
  const classes = useStyles()
  const { state, dispatch } = useWizzard();

  useEffect(() => {
    if(!state.csv){
      const isValid = false
      const values = {csv: { headerRow: "id;first name;last name", separator: ";", columns: ["id","first name","last name"] }}
      dispatch({ type: "SET_CONFIG", values, isValid })
    }
    if(state.csv?.headerRow && !state.csv?.separator){
      const guessSeparator = state.csv.headerRow.match(/[,|;|/t]/)[0]
      const guessColumns = state.csv.headerRow.split(guessSeparator)

      if (guessColumns.length > 0) {
        const isValid = true
        const values = {csv: { headerRow: state.csv.headerRow, separator: guessSeparator, columns: guessColumns }}
        dispatch({ type: "SET_CONFIG", values, isValid })
      }
    }
  }, [state.csv])

  const handleChangeSeparator = e => {
    const headerRow = state.csv.headerRow
    const separator = e.target.value
    const columns = state.csv.headerRow.split(separator).filter(!isEmpty)
    const isValid = columns.length > 0
    const values = {csv: { headerRow, separator, columns}}
    dispatch({ type: "SET_CONFIG", values, isValid })
  }
  const handleChangeHeaderRow = e => {
    const headerRow = e.target.value
    const separator = state.csv.separator
    const columns = headerRow.split(separator).filter(!isEmpty)
    const isValid = columns.length > 0
    const values = {csv: { headerRow, separator, columns}}
    dispatch({ type: "SET_CONFIG", values, isValid })
  }

  return (
    <>
      <div className={classes.container}>

        <FormGroup className={classes.headers}>
          <FormLabel component="legend">Enter header row</FormLabel>
          <TextField label="headers" value={state.csv?.headerRow} onChange={handleChangeHeaderRow} />
        </FormGroup>

        <FormControl component="fieldset">
          <FormLabel component="legend">Separator</FormLabel>
          <RadioGroup aria-label="separator" name="separator" value={state.csv?.separator} onChange={handleChangeSeparator} row>
            <FormControlLabel value="\t" control={<Radio />} label="Tab" />
            <FormControlLabel value="," control={<Radio />} label="Comma" />
            <FormControlLabel value=";" control={<Radio />} label="Semicolon" />
            <FormControlLabel value=" " control={<Radio />} label="Space" />
          </RadioGroup>
        </FormControl>

        <div className={classes.columns}>
          {state.csv?.columns?.map((column, index) => (
            <Card key={index} className={classes.column}>
              <CardContent>
                <div>Column {index + 1}</div>
                <div><strong>{column}</strong></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};
