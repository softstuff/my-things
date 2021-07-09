import {makeStyles} from '@material-ui/core';
import React from 'react';
import {Handle, Position} from 'react-flow-renderer';
import {useEdge} from './useEdge';

const useStyles = makeStyles((theme) => ({
  node: {
    
  },

  testData: {
  },

  argument: {

  }

}))

const InputNode = ({data}) => {
  const classes = useStyles()
  const {onlySingleEdge} = useEdge()

  return (
    <div className={classes.node}>
      {data.label}
      
      <Handle type="source" position={Position.Right} isValidConnection={onlySingleEdge}  />
    </div>
  );
}

export default InputNode