import { makeStyles } from '@material-ui/core';
import React, { useState } from 'react';

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

  const onDragStart = (event, node) => {
    const json = JSON.stringify(node)
    console.log("onDragStart", node, json)
    event.dataTransfer.setData('application/reactflow', json);
    event.dataTransfer.effectAllowed = 'move';
  };
  return (
    <aside>
      <div className="description">You can drag these nodes to the pane on the right.</div>
      <div className={classes.node} onDragStart={(event) => onDragStart(event, { type: 'join', data: {joiner: "-"}})} draggable>
        Join input
      </div>
      <div className={classes.node} onDragStart={(event) => onDragStart(event,  { type:'upper'})} draggable>
        To upper case
      </div>
      <div className={classes.node} onDragStart={(event) => onDragStart(event, { type:'lower'})} draggable>
        To lower case
      </div>
    </aside>
  );
};