import React from 'react';
import {Handle, Position} from 'react-flow-renderer';
import {useEdge} from './useEdge';

const CollectionKeyNode = ({data}) => {
  const {onlySingleEdge} = useEdge()

  return (
    <div>
      <Handle type="target" position={Position.Left} isValidConnection={onlySingleEdge}  />
      <div>Collection Key</div>
    </div>
  );
}

export default CollectionKeyNode