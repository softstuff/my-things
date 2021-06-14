

export const buildInitPayload = (input, config) => {

    if (config.type === "CSV") {
        const values = input.split(config.delimiter)
        return values.reduce((map, value, index) => {
            map[config.columns[index]] = value;
            return map;
            }, {});
    }
    throw new Error("Unsupported import type", config.type)
}

export const processChunk = (input, config, mapping) => {
    let payload = buildInitPayload(input, config)
    console.log("process ", payload)

    Object.keys(mapping.inputSelectorToInputNode)
      .forEach(inputSelector => {
        const inputNodeId = mapping.inputSelectorToInputNode[inputSelector]
        payload[inputNodeId] = payload[inputSelector]
        const firstEdge = mapping.nodeIdToedges[inputNodeId]
        pushIt({edge: firstEdge, payload, mapping})
      })
    return payload
  }

  /*
ein_0_out_0: {id: "ein_0_out_0", source: "in_0", target: "out_0", sourceHandle: null, targetHandle: null, …}
ein_1_out_1: {id: "ein_1_out_1", source: "in_1", target: "out_1", sourceHandle: null, targetHandle: null, …}
in_0: {id: "in_0", type: "input", data: {…}, position: {…}, sourcePosition: "right"}
in_1: {id: "in_1", type: "input", data: {…}, position: {…}, sourcePosition: "right"}
out_0: {id: "out_0", type: "argument", data: {…}, position: {…}, targetPosition: "left"}
out_1: {id: "out_1", type: "argument", data: {…}, position: {…}, targetPosition: "left"}
  */

export const pushIt = (args) => {
    if (!args.edge) return args

    const nextNode = args.mapping.nodeIdToNode[args.edge.target]
    
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

export const processInputNode = ({edge, payload, mapping}) => {
  const resultedge = mapping.nodeIdToedges[edge.target]
  payload[edge.target] = payload[edge.source]
  return {edge: resultedge, payload, mapping}
}

export const processOutputNode = ({edge, payload, mapping}) => {
  const outputNode = mapping.nodeIdToNode[edge.target]
  payload[outputNode.id] = payload[edge.source]
  return payload
}

export const processOutputIdNode = (args) => {
  return processOutputNode(args)
}

export const processActionLowerNode = ({edge, payload, mapping}) => {
  const resultedge = mapping.nodeIdToedges[edge.target]
  payload[edge.target] = payload[edge.source].toString().toLowerCase()
  return {edge: resultedge, payload, mapping}
}

export const processActionUpperNode = ({edge, payload, mapping}) => {
  const resultedge = mapping.nodeIdToedges[edge.target]
  payload[edge.target] = payload[edge.source].toString().toUpperCase()
  return {edge: resultedge, payload, mapping}
}

export const processActionJoinNode = ({edge, value, payload, mapping}) => {

  const joinNode = mapping.nodeIdToNode[edge.target]
  const outerHandle = edge.targetHandle === "a" ? "b" : "a"
  payload[`${edge.target}_${edge.targetHandle}`] = value

  if(payload[`${edge.target}_${outerHandle}`]) {
    const joinedValue = `${payload[`${edge.target}_a`]}${joinNode.data.joiner}${payload[`${edge.target}_b`]}`
    payload[`${edge.target}_c`] = joinedValue
    const resultEdge = mapping.nodeIdToedges[joinNode.id]
    return {edge: resultEdge, value: joinedValue, payload, mapping}
  } else {
    return {payload, mapping}
  }
  
}