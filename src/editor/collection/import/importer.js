import { isEdge, isNode } from "react-flow-renderer"

export const buildRegistry = (mapping) => {

  return {
    inputSelectorToInputNode: mapping.elements.filter(e => e.type === "input").reduce((map, current)=>{
        map[current.data.label] = current.id
        return map
      }, {})
    ,
    nodeIdToNode: mapping.elements.filter(isNode).reduce((map, current)=>{
      map[current.id] = current
      return map
    }, {})
    ,
    nodeIdToEdges: mapping.elements.filter(isEdge).reduce((map, current)=>{
      if(!map[current.source]) {
        map[current.source] = []
      } 
      map[current.source].push(current)
      return map
    }, {})
  }
}

export const processChunk = (input, type, config, register) => {
    let payload = buildInitPayload(input, type, config)

    Object.keys(register.inputSelectorToInputNode)
      .forEach(inputSelector => {
        const inputNodeId = register.inputSelectorToInputNode[inputSelector]
        payload[inputNodeId] = payload[inputSelector]
        const edges = register.nodeIdToEdges[inputNodeId]
        pushIt({edges, payload, register})
      })
    return payload
  }


export const buildInitPayload = (input, type, config) => {

  if (type === "CSV") {
      const values = input.split(config.separator)
      return values.reduce((map, value, index) => {
          map[config.columns[index]] = value;
          return map;
          }, {});
  }
  throw new Error("Unsupported import type", config.type)
}
export const pushIt = ({edges, payload, register}) => {

  edges?.forEach(edge => {
      const node = register.nodeIdToNode[edge.target]
    
      const nodeArgs = {edge, payload, register}
      if (node.type === "lower") {
        processActionLowerNode(nodeArgs)
      } else if (node.type === "upper") {
        processActionUpperNode(nodeArgs)
      } else if (node.type === "join") {
        processActionJoinNode(nodeArgs)
      } else if (node.type === "collectionKey") {
        processOutputIdNode(nodeArgs)
      } else if (node.type === "attribute") {
        processOutputNode(nodeArgs)
      }
      const nextEdges = register.nodeIdToEdges[node.id]
      if (nextEdges) {
        pushIt({edges: nextEdges, payload, register})
      }

    });

    
}

export const processOutputNode = ({edge, payload, register}) => {
  payload[edge.target] = payload[edge.source]
}

export const processOutputIdNode = ({edge, payload, register}) => {
  payload[edge.target] = payload[edge.source]
}

export const processActionLowerNode = ({edge, payload, register}) => {
  payload[edge.target] = payload[edge.source].toString().toLowerCase()
}

export const processActionUpperNode = ({edge, payload, register}) => {
  payload[edge.target] = payload[edge.source].toString().toUpperCase()
}

export const processActionJoinNode = ({edge, payload, register}) => {

  const joinNode = register.nodeIdToNode[edge.target]
  const outerHandle = edge.targetHandle === "a" ? "b" : "a"
  payload[`${edge.target}_${edge.targetHandle}`] = payload[edge.source]

  if(payload[`${edge.target}_${outerHandle}`]) {
    const joinedValue = `${payload[`${edge.target}_a`]}${joinNode.data.separator}${payload[`${edge.target}_b`]}`
    payload[edge.target] = joinedValue
  } 
  
}