

export const buildInitPayload = (config, data) => {

    if (config.type === "CSV") {
        const values = data.split(config.delimiter)
        return values.reduce((map, value, index) => {
            map[config.columns[index]] = value;
            return map;
            }, {});
    }
    throw new Error("Unsupported import type", config.type)
}

export const process = (payload, mapping) => {
    console.log("process ", payload)
    const out = Object.keys(payload).map((name, index) => {
      const nodeId = mapping.inputNameToNodeId[name]
      const node = mapping.nodeIdToNode[nodeId]
      const value = payload[name]
      return pushIt({node, value, payload, mapping})
    })
    return out
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
    
    if (args.node?.type === "input") {
      return pushIt(processInputNode(args))
    } else if (args.node?.type === "lower") {
      return pushIt(processActionLowerNode(args))
    } else if (args.node?.type === "argumentKey") {
    } else if (args.node?.type === "upper") {
      return pushIt(processActionUpperNode(args))
    } else if (args.node?.type === "argumentKey") {
      return processOutputIdNode(args)
    } else if (args.node?.type === "argument") {
      return processOutputNode(args)
    }
  }

export const processInputNode = ({node, value, payload, mapping}) => {
  const edge = mapping.nodeIdToedges[node.id]
  const target = mapping.nodeIdToNode[edge.target]

  return {node: target, value, payload, mapping}
}

export const processOutputNode = ({node, value, payload, mapping}) => {
  return {[node.data.name]: value}
}

export const processOutputIdNode = ({node, value, payload, mapping}) => {
  return {[node.data.name]: value, _id: true}
}

export const processActionLowerNode = ({node, value, payload, mapping}) => {
  const edge = mapping.nodeIdToedges[node.id]
  const target = mapping.nodeIdToNode[edge.target]
  const newValue = value.toString().toLowerCase()
  return {node: target, value: newValue, payload, mapping}
}

export const processActionUpperNode = ({node, value, payload, mapping}) => {
  const edge = mapping.nodeIdToedges[node.id]
  const target = mapping.nodeIdToNode[edge.target]
  const newValue = value.toString().toUpperCase()
  return {node: target, value: newValue, payload, mapping}
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