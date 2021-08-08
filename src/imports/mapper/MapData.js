import { makeStyles } from "@material-ui/core";
import React, { useEffect, useRef } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  ReactFlowProvider,
  removeElements,
  updateEdge,
} from "react-flow-renderer";
import InputNode from "./elements/InputNode";
import JoinActionNode from "./elements/JoinActionNode";
import ToLowerCaseActionNode from "./elements/ToLowerCaseActionNode";
import ToUpperCaseActionNode from "./elements/ToUpperCaseActionNode";
import StructureNode from "./elements/StructureNode";
import Sidebar from "./Sidebar";
import "./react-flow-overrides.scss";
import AttributeNode from "./elements/AttributeNode";
import CustomEdge from "./elements/CustomEdge";
import { MapperProvider, useMapper } from "./useMapper";
import CollectionKeyNode from "./elements/CollectionKeyNode";

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
  collectionKey: CollectionKeyNode,
  attribute: AttributeNode,
  join: JoinActionNode,
  lower: ToLowerCaseActionNode,
  upper: ToUpperCaseActionNode,
  structure: StructureNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const MapData =({ initElements, locked = false, inputs, payload, onElementsUpdate }) => {
  
  return (
    <MapperProvider initElements={initElements} locked={locked} inputs={inputs} payload={payload}>
      <MapFlow onElementsUpdate={onElementsUpdate} />
    </MapperProvider>
  );
};

const MapFlow = ({onElementsUpdate}) => {

  const classes = useStyles();
  const {elements, setElements, reactFlowInstance, setReactFlowInstance, locked, generateId} = useMapper()
  const reactFlowWrapper = useRef(null);

  useEffect(()=>{
    if (onElementsUpdate) {
      onElementsUpdate([...elements])
    }
  },[elements, onElementsUpdate])
  
  const onConnect = (params) => {
    params.type="custom"
    console.log("addEdge ", params);
    setElements((els) => addEdge(params, els));
  };
  const onElementsRemove = (elementsToRemove) => {
      console.log("onElementsRemove", elementsToRemove);
      setElements((els) => removeElements(elementsToRemove, els));
  };
  const onLoad = (_reactFlowInstance) => {
    console.log("onLoad set flow instance to ", _reactFlowInstance)
    setReactFlowInstance(_reactFlowInstance);
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
      id: generateId(),
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
            onEdgeUpdate={locked ? undefined : onEdgeUpdate }
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode={"Delete"}
          >
            <Background variant="lines" gap={12} size={1} />
            <Controls  showInteractive={!locked}  />
          </ReactFlow>
        </div>
        {!locked && (<div className={classes.sidebar}>
          <Sidebar />
        </div>)}
      </ReactFlowProvider>
    </div>
  );
}

export default MapData