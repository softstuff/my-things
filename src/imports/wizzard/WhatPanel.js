import {Card, CardContent, Radio, FormControlLabel, makeStyles, Typography, RadioGroup, Paper} from "@material-ui/core";
import { useDropzone } from "react-dropzone";
import {useCallback, useEffect, useMemo, useState} from "react";
import { useWizzard } from "./useWizzard";
import LineNavigator from "line-navigator";
import {useSnackbar} from 'notistack';

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    gap: "1rem",
    minHeight: "40vh",
  },
  types: {
    flex: "1",

    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: "1rem",
  },
  orSeparator: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: '10rem'
    // color: "#d3d7da",
  },
  verticalLine: {
    borderLeft: "1px solid #d3d7da",
    flexGrow: "1",
    width: "1px",
  },
  dropzone: {
    flex: "1",
  },
}))


const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  height: '7rem'
  // borderWidth: 2,
  // borderRadius: 2,
  // borderColor: '#eeeeee',
  // borderStyle: 'dashed',
  // backgroundColor: '#fafafa',
  // color: '#bdbdbd',
  // outline: 'none',
  // transition: 'border .24s ease-in-out'
};

const activeStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

export function WhatPanel() {
  const classes = useStyles()
  const {state, dispatch} = useWizzard()
  const {enqueueSnackbar} = useSnackbar()

  useEffect(()=>{
    dispatch({type: "SET_TYPE", value: state.type, isValid: state.type !== null})
  },[dispatch, state.type])

  const onDrop = useCallback((acceptedFiles, fileRejections, event) => {
    if(acceptedFiles.length !== 1) {
      console.error("failed to upload file", fileRejections, event)
    }
    const type = acceptedFiles[0].type.split('/').pop()
    console.log(`onDrop  ${acceptedFiles.length} acceptedFiles, ${fileRejections.length} fileRejections`,acceptedFiles, type )

    if (type.match(/csv/i)){


      const navigator = new LineNavigator(acceptedFiles[0]);

      navigator.readLines(0, 3, (err, index, lines, isEof, progress) => {
        console.log(`read`, lines)
        dispatch({type: "SET_TYPE",
          value: "CSV",
          isValid: true,
          testFile: acceptedFiles[0],
          testLines: lines})
        enqueueSnackbar("Good job, using CSV for this importer", { variant: 'info'})
      })

    } else {
      enqueueSnackbar(`File type ${type} is not supported`, {variant: "error"})
    }

  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({onDrop, maxFiles: 1 });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  const handleChangeType = event => {
    console.log("handleChangeType ", event.target.name, event.target.value, event.target.checked)
    const newType = event.target.value
    dispatch({type: "SET_TYPE", value: newType, isValid: state.type !== null})
  }
  return (
    <>
      <div className={classes.container}>
        <RadioGroup className={classes.types} aria-label="type" name="type" value={state.type} onChange={handleChangeType}>
          <TypeCard type={"CSV"} />
          <TypeCard type={"JSON"} disabled={true} />
          <TypeCard type={"XML"} disabled={true} />
          <TypeCard type={"YAML"} disabled={true} />
        </RadioGroup>

        <div className={classes.orSeparator}>
          <div className={classes.verticalLine}></div>
          <div>OR</div>
          <div className={classes.verticalLine}></div>
        </div>

        <div className={classes.dropzone}>

          <Paper elevation={2} {...getRootProps({style})}>
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>Drop the files here ...</p>
            ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
            )}
          </Paper>
        </div>
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
