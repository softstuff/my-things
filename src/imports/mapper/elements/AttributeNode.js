import React, {useEffect, useRef, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import {Handle, Position} from 'react-flow-renderer';
import {useEdge} from './useEdge';
import {Box, Button, DialogContent, TextField, Typography} from '@material-ui/core';
import { useMapper } from '../useMapper';
import {Controller, useForm, useFormContext} from 'react-hook-form';

import { NodeSettings, NodeSettingsDialog } from './NodeSettingsDialog';
import _ from 'lodash'


const useStyles = makeStyles((theme) => ({
  paper: {
    border: '1px solid',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: "space-between"
  },
  settingsItem: {
    flexGrow: 0
  }
}));


const AttributeNode = (props) => {
  const {onlySingleEdge} = useEdge()
  const classes = useStyles();
  const [error, setError] = useState()
  

  useEffect(()=>{
    console.log("ArgumentNode props change", props)
    setError( _.isEmpty(props.data.label) ? "Name is not set" : null)
  }, [props])

  return (
    <>
      <Handle type="target" position={Position.Left}  isValidConnection={onlySingleEdge}  />
      <NodeSettings nodeId={props.id} title={"Attribute"} >
        <AttributeNodeSettings data={props.data} />
      </NodeSettings>

      <Box display='flex' flexDirection="row" >
        <Typography>
          {props.data.label} {props.data.required === 'yes' ? '*':''}
        </Typography>
        {error && (<Typography color="error">{error}</Typography>)}
      </Box>
    </>
  );
}

const AttributeNodeSettings = ({data}) => {
  const { control } = useFormContext();

  return (
    <Controller
            name={"label"}
            control={control}
            defaultValue={data.label}
            rules={{ required: "Select the a name for the attribute" }}
            render={({ field, fieldState:{invalid, error} }) => (
              <TextField 
                label="Name" {...field} 
                helperText={error?.message}
                error={invalid}/>
            )}
          />
  )
}




export default AttributeNode