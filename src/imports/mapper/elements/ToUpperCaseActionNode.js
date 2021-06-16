import React from 'react';
import {Handle, Position} from 'react-flow-renderer';
import {useEdge} from './useEdge';

const ToUpperCaseActionNode = () => {
  const {onlySingleEdge} = useEdge()

  return (
    <div>
      <Handle type="target" position={Position.Left} isValidConnection={onlySingleEdge}/>
      <div>To upper case</div>
      <Handle type="source" position={Position.Right} isValidConnection={onlySingleEdge}/>
    </div>
  );
}

export default ToUpperCaseActionNode