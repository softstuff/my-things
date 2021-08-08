import React, {createRef, useEffect, useRef, useState} from 'react';
import {Handle, Position} from 'react-flow-renderer';
import {useEdge} from './useEdge';
import {Box, TextField, Typography} from '@material-ui/core';
import {Controller, useFormContext} from 'react-hook-form';
import { NodeSettings } from './NodeSettingsDialog';
import isEmpty from 'lodash/isEmpty'
import { useMapper } from '../useMapper';


const StructureNode = (props) => {
  const {onlySingleEdge} = useEdge()
  const [error, setError] = useState()
  const {elements, setElements} = useMapper()
  const [refs, setRefs] = useState([])
  

  useEffect(()=>{
    console.log("StructureNode props change", props)
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

    setRefs( props.data.properties.map(_ => createRef()))

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data])

  return (
    <>
      {/* <Handle type="target" position={Position.Left}  isValidConnection={onlySingleEdge}  />
      <NodeSettings nodeId={props.id} title={"Structure"} >
        <AttributeNodeSettings data={props.data} />
      </NodeSettings> */}

      <Box display='flex' flexDirection="column" alignItems="flex-start" >
        
        <NodeSettings nodeId={props.id} title={"Structure"} >
          <AttributeNodeSettings data={props.data} />
        </NodeSettings>
        <Typography variant="subtitle1">
          {props.data.label}
        </Typography>

        {props.data.properties?.map( (p,i) => (
          <PropertyComponent key={i} prop={p} index={i} length={props.data.properties.length} />
          // <div key={i}  ref={refs[i]}>
          //   <Handle id={i} style={{top: `calc( ${((i+1)/props.data.properties.length)*100}%, -0.5rem)`}} type="target" position={Position.Left}  isValidConnection={onlySingleEdge}  />
          //   <Typography>
          //     {p.name} {refs[i]?.current?.getBoundingClientRect()}
          //   </Typography>
          // </div>
        ))}

        {error && (<Typography color="error">{error}</Typography>)}
      </Box>
    </>
  );
}

const PropertyComponent = ({prop, index, length}) => {
  const {onlySingleEdge} = useEdge()
  const ref = useRef()
  
  console.log(" Prop", prop.name, ref.current?.offsetTop, ref.current?.getBoundingClientRect())

  return (
    <div ref={ref}>
      <Handle id={index} style={{ top: ref.current?.offsetTop+((ref.current?.getBoundingClientRect().height/2))}} type="target" position={Position.Left}  isValidConnection={onlySingleEdge}  />
      <Typography>
        {prop.name} 
      </Typography>
    </div>
  )
  
}

const AttributeNodeSettings = ({data}) => {
  const { control } = useFormContext();

  return (
    <> ToDo
    </>
    // <Controller
    //         name={"label"}
    //         control={control}
    //         defaultValue={data.label}
    //         rules={{ required: "Select the a name for the s" }}
    //         render={({ field, fieldState:{invalid, error} }) => (
    //           <TextField 
    //             label="Name" {...field} 
    //             helperText={error?.message}
    //             error={invalid}/>
    //         )}
    //       />
  )
}




export default StructureNode