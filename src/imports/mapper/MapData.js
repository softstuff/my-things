import { makeStyles } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  ReactFlowProvider,
  removeElements,
  updateEdge,
  useStoreState,
} from "react-flow-renderer";
import InputNode from "./elements/InputNode";
import JoinActionNode from "./elements/JoinActionNode";
import ToLowerCaseActionNode from "./elements/ToLowerCaseActionNode";
import ToUpperCaseActionNode from "./elements/ToUpperCaseActionNode";
import Sidebar from "./Sidebar";
import "./react-flow-overrides.scss";
import ArgumentNode from "./elements/ArgumentNode";
import ArgumentKeyNode from "./elements/ArgumentKeyNode";
import { useDebounce } from "../../utils/useDebounce";
import CustomEdge from "./elements/CustomEdge";

const useStyles = makeStyles(() => ({
  container: {
    flexDirection: "row",
    display: "flex",
    height: "30rem",
    width: "100%",
  },
  main: {
    flexGrow: "1",
  },
  sidebar: {
    borderRight: "1px solid #eee",
    padding: "15px 10px",
    fontSize: "12px",
    background: "#fcfcfc",
    width: "20%;",
    maxWidth: "250px",
  },
}));

const nodeTypes = {
  input: InputNode,
  argumentKey: ArgumentKeyNode,
  argument: ArgumentNode,
  join: JoinActionNode,
  lower: ToLowerCaseActionNode,
  upper: ToUpperCaseActionNode,
};
const unremmovableNodeTypes = ["input", "argumentKey", "argument"];

const edgeTypes = {
  custom: CustomEdge,
};

let id = 4;
const getId = () => `dndnode_${id++}`;

export default ({
  // inputs,
  // outputs,
  // actions,
  // edges,
  initElements,
  setRfInstance,
  locked = false
}) => {
  const classes = useStyles();

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [elements, setElements] = useState(initElements);

  useEffect(()=>{
    setElements(initElements)
  }, [initElements])

  const onConnect = (params) => {
    console.log("addEdge ", params);
    setElements((els) => addEdge(params, els));
  };
  const onElementsRemove = (elementsToRemove) => {
    if (
      elementsToRemove.some((element) =>
        unremmovableNodeTypes.includes(element.type)
      ) == false
    ) {
      console.log("onElementsRemove", elementsToRemove);
      setElements((els) => removeElements(elementsToRemove, els));
    } else {
      console.log("onElementsRemove, can not be removed", elementsToRemove);
    }
  };
  const onLoad = (_reactFlowInstance) => {
    console.log("onLoad set flow instance to ", _reactFlowInstance)
    setReactFlowInstance(_reactFlowInstance);
    setRfInstance(_reactFlowInstance);
  };
  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };
  const onDrop = (event) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const json = event.dataTransfer.getData("application/reactflow");
    const node = JSON.parse(json);

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    const newNode = {
      id: getId(),
      type: node.type,
      position,
      data: { ...node.data },
    };
    setElements((es) => es.concat(newNode));
  };

  const onEdgeUpdate = (oldEdge, newConnection) => {
    console.log("onEdgeUpdate", oldEdge, newConnection);
    setElements((els) => updateEdge(oldEdge, newConnection, els));
  };

  // useEffect(() => {
  //   if( inputElements.length > 0 || outputElements.length > 0  || edgesElement.length > 0  || actionsElement.length > 0 ) {
     
  //     console.log("Init elements", inputs, outputs, edges, actions);
  //     const inputElements = inputs.map((node, index) => ({
  //       id: node.id,
  //       type: node.type || "input",
  //       data: { label: node.name },
  //       position: node.position || { x: 0, y: index * 80 + 20 },
  //       sourcePosition: "right",
  //     }));

  //     const outputElements = outputs.map((node, index) => ({
  //       id: node.id,
  //       type: node.key ? "argumentKey" : "argument",
  //       data: { ...node },
  //       position: node.position || { x: 500, y: index * 60 + 20 },
  //       targetPosition: "left",
  //     }));

  //     const edgesElement = edges.map((edge) => ({
  //       id: `e${edge.source}_${edge.target}`,
  //       ...edge,
  //     }));

  //     const actionsElement = actions.map((actions) => ({
  //       ...actions,
  //     }));

    

  //    const newElements = [
  //       ...inputElements,
  //       ...outputElements,
  //       ...edgesElement,
  //       ...actionsElement,
  //     ]
  //     console.log(
  //       "Set elements to ",newElements );
  //     setElements(newElements);
  //   }
  // }, [inputs, outputs, actions, edges]);

  return (
    <div className={classes.container}>
      <ReactFlowProvider>
        <div className={classes.main} ref={reactFlowWrapper}>
          <ReactFlow
            elements={elements}
            nodesConnectable={!locked}
            nodesDraggable={!locked}
            onConnect={onConnect}
            onElementsRemove={onElementsRemove}
            onLoad={onLoad}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onEdgeUpdate={onEdgeUpdate}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
          >
            <Background variant="lines" gap={12} size={1} />
            <Controls  showInteractive={!locked} />
          </ReactFlow>
        </div>
        {!locked && (<div className={classes.sidebar}>
          <Sidebar />
        </div>)}
      </ReactFlowProvider>
    </div>
  );
};
