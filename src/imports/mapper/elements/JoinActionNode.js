import {TextField} from '@material-ui/core';
import React from 'react';
import {Handle, Position} from 'react-flow-renderer';
import { Controller, useFormContext } from 'react-hook-form';
import { NodeSettings } from './NodeSettingsDialog';
import {useEdge} from './useEdge';

const JoinActionNode = ({id, data}) => {
    const sourceHandleStyle = {}
    const targetHandleStyleA = { ...sourceHandleStyle, top: '25%' };
    const targetHandleStyleB = { ...sourceHandleStyle, top: '75%' };
    const {onlySingleEdge} = useEdge()

    return (
        <div >
          <Handle id="a" type="target" position={Position.Left} style={targetHandleStyleA} isValidConnection={onlySingleEdge}/>
          <Handle id="b" type="target" position={Position.Left} style={targetHandleStyleB} isValidConnection={onlySingleEdge} />
          <NodeSettings nodeId={id} title={"Join"} >
            <JoinNodeSettings data={data} />
          </NodeSettings>

          <div><strong>{data.separator}</strong></div>

          <Handle id="c" type="source" position={Position.Right} style={sourceHandleStyle} isValidConnection={onlySingleEdge}/>
        </div>
      );
}


const JoinNodeSettings = ({data}) => {
  const { control } = useFormContext();

  return (
    <Controller
            name={"separator"}
            control={control}
            defaultValue={data.separator}
            render={({ field, fieldState:{invalid, error} }) => (
              <TextField
                label="By separator" {...field} 
                helperText={error?.message}
                error={invalid}/>
            )}
          />
  )
}

export default JoinActionNode