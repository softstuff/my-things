import { TextField } from '@material-ui/core';
import React,  { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { useEdge } from './useEdge';

const JoinActionNode = ({data}) => {
    const [separator, setSeparator] = useState(data.joiner)
    const [editing, setEditing] = useState(false)
    const sourceHandleStyle = {}
    const targetHandleStyleA = { ...sourceHandleStyle, top: '25%' };
    const targetHandleStyleB = { ...sourceHandleStyle, top: '75%' };
    const {onlySingleEdge} = useEdge()

    return (
        <div >
          <Handle id="a" type="target" position={Position.Left} style={targetHandleStyleA} isValidConnection={onlySingleEdge}/>
          <Handle id="b" type="target" position={Position.Left} style={targetHandleStyleB} isValidConnection={onlySingleEdge} />
          
          {editing && (
          <TextField label="Joined by" 
              defaultValue={separator} 
              onChange={(e)=>{setSeparator(e.target.value);}}
              onBlur={()=>setEditing(false)}
              size="small"
              style = {{width: '5rem'}} draggable={false}/>
              )}
          {!editing && (<div onDoubleClick={()=>setEditing(true)} title='Dubble tap to edit' >Joinded by {separator}</div>)}

          <Handle id="c" type="source" position={Position.Right} style={sourceHandleStyle} isValidConnection={onlySingleEdge}/>
        </div>
      );
}

export default JoinActionNode