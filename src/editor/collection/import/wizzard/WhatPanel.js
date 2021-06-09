import { Card, CardContent, Checkbox, Grid, Typography, withStyles } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { useWizzard } from "./useWizzard";

export function WhatPanel() {

  return (
    <>
      <h2>What</h2>
      <Grid container direction="row" justify="center" alignItems="center">
        <TypeCard type={"CSV"} />
      </Grid>
    </>
  );
}

const TypeCard = ({type}) => {
  const {state, dispatch} = useWizzard()
  const handleClick = () => {
    const isValid = type !== null
    dispatch({type: "SET_TYPE", value: type, isValid})
  }
  return (
    <Card variant="outlined" onClick={handleClick}>
    <CardContent>
      <Typography variant="h5" component="h2">
        CSV
      </Typography>
      <GreenCheckbox
        checked={state.type === type}
      ></GreenCheckbox>
    </CardContent>
    </Card>)
}
const GreenCheckbox = withStyles({
  root: {
    color: green[400],
    '&$checked': {
      color: green[600],
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);
