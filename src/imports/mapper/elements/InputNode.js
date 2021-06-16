import {makeStyles, TextField} from '@material-ui/core';
import React, {useState} from 'react';
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
  const [testData, setTestData] = useState(data.testData)

  return (
    <div className={classes.node}>
      {data.label}
      {/* <TextField label={data.label} variant="outlined" value={testData} onChange={e=>setTestData(e.target.value)} size="small" margin="dense" /> */}

      <Handle type="source" position={Position.Right} isValidConnection={onlySingleEdge}  />
    </div>
  );
}

export default InputNode