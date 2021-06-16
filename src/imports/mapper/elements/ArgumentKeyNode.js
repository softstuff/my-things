import React from 'react';
import {Handle, Position} from 'react-flow-renderer';
import {useEdge} from './useEdge';

const ArgumentKeyNode = ({data}) => {
  const {onlySingleEdge} = useEdge()

  return (
    <div>
      <Handle type="target" position={Position.Left} isValidConnection={onlySingleEdge}  />
      <div>{data.label}*(key)</div>
    </div>
  );
}

export default ArgumentKeyNode