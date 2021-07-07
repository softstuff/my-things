const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const { storage } = require('../../src/firebase/config');
const csv = require('csv-parser');
const { firestore } = require('../firebase-service');
// const fs = require('fs');

const logger = functions.logger

const isEdge = element => {
    return 'target' in element
}

const isNode = element => {
    return !isEdge(element)
}

const buildRegistry = (mapping) => {

    return {
      inputSelectorToInputNode: mapping.elements.filter(e => e.type === "input").reduce((map, current)=>{
          map[current.data.label] = current.id
          return map
        }, {})
      ,
      outputNodes: mapping.elements.filter(e => e.type === "attribute"),
      keyNodeId: mapping.elements.find(e => e.type === "collectionKey")?.id
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
  
  const processChunk = (chunk, registry) => {
      let payload = {...chunk}
  
      Object.keys(registry.inputSelectorToInputNode)
        .forEach(inputSelector => {
          const inputNodeId = registry.inputSelectorToInputNode[inputSelector]
          payload[inputNodeId] = payload[inputSelector]
          const edges = registry.nodeIdToEdges[inputNodeId]
          pushIt({edges, payload, registry})
        })
      const key = registry.keyNodeId ? payload[registry.keyNodeId] : "not set"
      const attributes = registry.outputNodes.reduce((map, current)=>{
        map[current.data.label] = payload[current.id]
        return map
      }, {})
      return {result: { key, attributes}, payload }
    }

  const pushIt = ({edges, payload, registry}) => {
  
    edges?.forEach(edge => {
        const node = registry.nodeIdToNode[edge.target]
      
        const nodeArgs = {edge, payload, registry}
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
        const nextEdges = registry.nodeIdToEdges[node.id]
        if (nextEdges) {
          pushIt({edges: nextEdges, payload, registry})
        }
  
      });
  
      
  }
  
  const processOutputNode = ({edge, payload, registry}) => {
    payload[edge.target] = payload[edge.source]
  }
  
  const processOutputIdNode = ({edge, payload, registry}) => {
    payload[edge.target] = payload[edge.source]
  }
  
  const processActionLowerNode = ({edge, payload, registry}) => {
    payload[edge.target] = payload[edge.source].toString().toLowerCase()
  }
  
  const processActionUpperNode = ({edge, payload, registry}) => {
    payload[edge.target] = payload[edge.source].toString().toUpperCase()
  }
  
  const processActionJoinNode = ({edge, payload, registry}) => {
  
    const joinNode = registry.nodeIdToNode[edge.target]
    const outerHandle = edge.targetHandle === "a" ? "b" : "a"
    payload[`${edge.target}_${edge.targetHandle}`] = payload[edge.source]
  
    if(payload[`${edge.target}_${outerHandle}`]) {
      const joinedValue = `${payload[`${edge.target}_a`]}${joinNode.data.separator}${payload[`${edge.target}_b`]}`
      payload[edge.target] = joinedValue
    } 
    
  }


exports.imports = functions.storage.bucket().object().onFinalize( async (object, context) => {


    console.log("ss ", context)
    console.log("Uploaded ", object.bucket, object.name, object.id)
    logger.debug("metadata", object?.metadata)

    try{
        const {tenantId, wid, iid } = object.metadata
        const workspaceDocPath = `/tenants/${tenantId}/workspaces/${wid}`
        logger.debug("Got workspaceDocPath", workspaceDocPath)

        const workspaceSnap = await firestore.doc(workspaceDocPath).get()
        const importConfig = workspaceSnap.get(`imports.${iid}`)
        logger.debug("Import config:", importConfig)

        const registry = buildRegistry(importConfig.mapping)
        logger.debug("registry", registry)

        const file = admin.storage().bucket(object.bucket).file(object.name)
        console.log("File", file.name)
        logger.debug("File", file.name)
        // const [tenantId,wid,importConfigId,fileName] = file.name.split()
        // fs.createReadStream(file)
        const parsePromise = new Promise((resolve, reject) => {
            file.createReadStream()
            .pipe(csv( optionsOrHeaders = {
                separator: importConfig.config.separator,
                skipComments: true,
            }

            ))
            .on('data', async (row) => {
                console.log(`row:`, row);
                const {result} = processChunk(row, registry)
                console.log("Got result",result)

                const collection = "Person"
                await firestore.collection(`/tenants/${tenantId}/workspaces/${wid}/${collection}`)
                .doc(result.key)
                .set(result.attributes)
                console.log("Imported row")
            })
            .on('end', function () {
                console.log("Done")
                resolve(file)
            })        
            .on("error", err => reject(err))     
        })
        
        return parsePromise
            .then(file => {
                logger.debug("Deleted")
                // file.delete()
            })
            .then(()=> logger.debug("Exit"))
            .catch( error => logger.debug("Error", error))

        // await file.delete()
        // console.log("Deleted")
        // console.log("Exit")
    } catch(e){
        console.log("Error", e)
    }
})