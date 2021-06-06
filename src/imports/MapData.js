import {makeStyles} from '@material-ui/core';
import React, {useEffect, useRef, useState} from 'react';
import ReactFlow, {addEdge, Background, Controls, ReactFlowProvider, removeElements,} from 'react-flow-renderer';
import InputNode from './actions/InputNode';
import JoinActionNode from './actions/JoinActionNode'
import ToLowerCaseActionNode from './actions/ToLowerCaseActionNode';
import ToUpperCaseActionNode from './actions/ToUpperCaseActionNode';
import Sidebar from './Sidebar';
import "./react-flow-overrides.scss"
import ArgumentNode from './actions/ArgumentNode';
import ArgumentKeyNode from './actions/ArgumentKeyNode';

const useStyles = makeStyles(() => ({
  container: {
    flexDirection: 'row',
    display: 'flex',
    height: '30rem',
    width: '100%',
  },
  main: {
    flexGrow: '1'
  } ,
  sidebar: {
    borderRight: '1px solid #eee',
    padding: '15px 10px',
    fontSize: '12px',
    background: '#fcfcfc',
    width: '20%;',
    maxWidth: '250px'
  },
}));

const nodeTypes = {
    input: InputNode,
    argumentKey: ArgumentKeyNode,
    argument: ArgumentNode,
    join: JoinActionNode,
    lower: ToLowerCaseActionNode,
    upper: ToUpperCaseActionNode
  };
const unremmovableNodeTypes = ['input','argumentKey','argument']

let id = 4;
const getId = () => `dndnode_${id++}`;

export default ({inputs, outputs, actions, edges, setRfInstance}) => {
  const classes = useStyles()
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [elements, setElements] = useState();

    const onConnect = (params) => {
      console.log("addEdge ", params)
      setElements((els) => addEdge(params, els));
    }
    const onElementsRemove = (elementsToRemove) => {
      if( elementsToRemove.some(element =>  unremmovableNodeTypes.includes(element.type)) == false) {
        console.log('onElementsRemove', elementsToRemove)
        setElements((els) => removeElements(elementsToRemove, els));
      } else {
        console.log('onElementsRemove, can not be removed', elementsToRemove)
      }
    }
    const onLoad = (_reactFlowInstance) => {
      setReactFlowInstance(_reactFlowInstance);
      setRfInstance(_reactFlowInstance)
    }
    const onDragOver = (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    };
    const onDrop = (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const json = event.dataTransfer.getData('application/reactflow');
      const node = JSON.parse(json)

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type: node.type,
        position,
        data: { ...node.data},
      };
      setElements((es) => es.concat(newNode));
    };

    useEffect(()=>{
      console.log("Init elements", inputs, outputs, edges, actions)
      const inputElements = inputs.map( (node, index) => ({
          id: node.id,
          type: node.type || 'input',
          data: { label: node.name },
          position: node.position ||{ x: 0, y: (index + 1) * 50 },
          sourcePosition: 'right',
        }))

      const outputElements = outputs.map( (node, index) => ({
        id: node.id,
        type: node.key ? 'argumentKey' : 'argument',
        data: { ...node },
        position: node.position || { x: 600, y: (index + 1) * 50 },
        targetPosition: 'left',
      }))

      const edgesElement = edges.map(edge => ({
          id: `e${edge.source}_${edge.target}`, ...edge
        }
      ))
      
      const actionsElement = actions.map(actions => ({
        ...actions
      }
    ))

    console.log("Set outputElements to ", inputElements, outputElements, edgesElement, actionsElement)
    
        setElements([...inputElements, ...outputElements, ...edgesElement, ...actionsElement])
    }, [inputs, outputs, actions, edges])

    return (
        <div className={classes.container}>
            <ReactFlowProvider>
                <div className={classes.main} ref={reactFlowWrapper}>
                <ReactFlow
                    elements={elements}
                    onConnect={onConnect}
                    onElementsRemove={onElementsRemove}
                    onLoad={onLoad}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                >
                  <Background
                    variant="lines"
                    gap={12}
                    size={1}
                  />
                    <Controls />
                </ReactFlow>
                </div>
                <div className={classes.sidebar}>
                  <Sidebar />
                </div>
            </ReactFlowProvider>
        </div>)
}

