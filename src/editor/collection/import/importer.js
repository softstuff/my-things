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
    nodeIdToedges: mapping.elements.filter(isEdge).reduce((map, current)=>{
      map[current.source] = current
      return map
    }, {})
  }
}

export const processChunk = (input, type, config, register) => {
    let payload = buildInitPayload(input, type, config)
    console.log("process ", payload)

    Object.keys(register.inputSelectorToInputNode)
      .forEach(inputSelector => {
        const inputNodeId = register.inputSelectorToInputNode[inputSelector]
        payload[inputNodeId] = payload[inputSelector]
        const firstEdge = register.nodeIdToedges[inputNodeId]
        pushIt({edge: firstEdge, payload, register})
      })
    return payload
  }


export const buildInitPayload = (input, type, config) => {

  if (type === "CSV") {
      const values = input.split(config.delimiter)
      return values.reduce((map, value, index) => {
          map[config.columns[index]] = value;
          return map;
          }, {});
  }
  throw new Error("Unsupported import type", config.type)
}
export const pushIt = (args) => {
    if (!args.edge) return args

    const nextNode = args.register.nodeIdToNode[args.edge.target]
    
    let nextArgs = null
    if (nextNode.type === "lower") {
      nextArgs = processActionLowerNode(args)
    } else if (nextNode.type === "upper") {
      nextArgs = processActionUpperNode(args)
    } else if (nextNode.type === "join") {
      nextArgs = processActionJoinNode(args)
    } else if (nextNode.type === "argumentKey") {
      nextArgs = processOutputIdNode(args)
    } else if (nextNode.type === "argument") {
      nextArgs = processOutputNode(args)
    }
    return pushIt(nextArgs)
}

export const processOutputNode = ({edge, payload, register}) => {
  const outputNode = register.nodeIdToNode[edge.target]
  payload[outputNode.id] = payload[edge.source]
  return payload
}

export const processOutputIdNode = (args) => {
  return processOutputNode(args)
}

export const processActionLowerNode = ({edge, payload, register}) => {
  const resultedge = register.nodeIdToedges[edge.target]
  payload[edge.target] = payload[edge.source].toString().toLowerCase()
  return {edge: resultedge, payload, register}
}

export const processActionUpperNode = ({edge, payload, register}) => {
  const resultedge = register.nodeIdToedges[edge.target]
  payload[edge.target] = payload[edge.source].toString().toUpperCase()
  return {edge: resultedge, payload, register}
}

export const processActionJoinNode = ({edge, payload, register}) => {

  const joinNode = register.nodeIdToNode[edge.target]
  const outerHandle = edge.targetHandle === "a" ? "b" : "a"
  payload[`${edge.target}_${edge.targetHandle}`] = payload[edge.source]

  if(payload[`${edge.target}_${outerHandle}`]) {
    const joinedValue = `${payload[`${edge.target}_a`]}${joinNode.data.joiner}${payload[`${edge.target}_b`]}`
    payload[edge.target] = joinedValue
    const resultEdge = register.nodeIdToedges[joinNode.id]
    return {edge: resultEdge, payload, register}
  } else {
    return {payload, register}
  }
  
}