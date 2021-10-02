import React, {useEffect, useState} from 'react';
import {Handle, Position} from 'react-flow-renderer';
import {useEdge} from './useEdge';
import {Box, TextField, Typography} from '@mui/material';
import {Controller, useFormContext} from 'react-hook-form';
import { NodeSettings } from './NodeSettingsDialog';
import isEmpty from 'lodash/isEmpty'
import { useMapper } from '../useMapper';


const AttributeNode = (props) => {
  const {onlySingleEdge} = useEdge()
  const [error, setError] = useState()
  const {elements, setElements} = useMapper()
  

  useEffect(()=>{
    console.log("ArgumentNode props change", props)
    const isValid = !isEmpty(props.data.label)
    setError( isValid ? null : "Name is not set")

    if (elements && isValid !== props.data.isValid) {
      console.log("Update element to isValid",isValid)
      setElements(
          elements.map(el=> {
          if (el.id === props.id) {
              el.data = {...el.data, isValid}
          }
          return el
          })
      )
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data])

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