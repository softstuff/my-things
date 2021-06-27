import {makeStyles} from '@material-ui/core';
import React from 'react';
import { useMapper } from './useMapper';

const useStyles = makeStyles((theme) => ({
  node: {
    padding: '10px',
    border: '1px solid #1a192b',
    borderRadius: '3px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'grab',
    width: '150px'
  }
}))

export default () => {

  const classes = useStyles()

  const {unmappedInputs} = useMapper()

  const onDragStart = (event, node) => {
    const json = JSON.stringify(node)
    console.log("onDragStart", node, json)
    event.dataTransfer.setData('application/reactflow', json);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside>
      

      <p>
        Import input:
        {unmappedInputs.map((input,index) => (
          <div key={index} className={classes.node} onDragStart={(event) => onDragStart(event, { type:'input', data: {label: input}})} draggable>
            {input}
          </div>
        ))}
        {unmappedInputs.length == 0 && (<div>All inputs is mapped</div>)}
      </p>
      <p>
        <div className={classes.node} onDragStart={(event) => onDragStart(event, { type:'collectionKey'})} draggable>
          Collection key
        </div>
      </p>
      <p>
        Result attribute:
        <div className={classes.node} onDragStart={(event) => onDragStart(event, { type:'attribute', data: {label: ""}})} draggable>
          Attribute
        </div>
      </p>
      <p> Actions:
      <div className={classes.node} onDragStart={(event) => onDragStart(event, { type: 'join', data: {separator: "-"}})} draggable>
        Join input
      </div>
      <div className={classes.node} onDragStart={(event) => onDragStart(event,  { type:'upper'})} draggable>
        To upper case
      </div>
      <div className={classes.node} onDragStart={(event) => onDragStart(event, { type:'lower'})} draggable>
        To lower case
      </div>
      </p>
    </aside>
  );
};