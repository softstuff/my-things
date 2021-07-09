const functions = require('firebase-functions');
const admin = require('firebase-admin');
const csv = require('csv-parser');
const { firestore, database } = require('../firebase-service');
const { Transform, Stream } = require('stream');

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

  const encodeKey = key => {
    return key.replace(".", "_dot_")
  }

  const runtimeOpts = {
    timeoutSeconds: 300,
    memory: '1GB'
  }
  
exports.imports = functions
  // .runWith(runtimeOpts)
  .storage
  .bucket()
  .object()
  .onFinalize( async (object, context) => {


    console.log("ss ", context)
    console.log("Uploaded ", object.bucket, object.name, object.id)
    logger.debug("metadata", object?.metadata)

    try{
        const {tenantId, wid, iid, batchId } = object.metadata
        const workspaceDocPath = `/tenants/${tenantId}/workspaces/${wid}`
        logger.debug("Got workspaceDocPath", workspaceDocPath)

        const workspaceSnap = await firestore.doc(workspaceDocPath).get()
        const importConfig = workspaceSnap.get(`imports.${iid}`)
        logger.debug("Import config:", importConfig)

        const registry = buildRegistry(importConfig.mapping)
        logger.debug("registry", registry)

        const file = admin.storage().bucket(object.bucket).file(object.name)
        console.log("File path", file.name)
        logger.debug("File path", file.name)
        const fileName = file.name.split("/")[4]
        console.log("Uploaded filename", fileName)
        

        const statRef = database.ref(`${tenantId}/${wid}/imports/${iid}/${batchId}`)

        const statSnap = await statRef.get()
        if(!statSnap.exists()) {
          statRef.set({
            startedAt: admin.database.ServerValue.TIMESTAMP,
            imported: 0,
            failed: 0
          })
        }


        const files = statRef.child("files")
        var i = 0
        var fileStatRef = files.child(encodeKey(fileName))
        
        while(++i < 1000 && (await fileStatRef.get()).exists()) {
          fileStatRef = files.child(`${encodeKey(fileName)}_${i}`)
        }
        await fileStatRef.set({
          startedAt: admin.database.ServerValue.TIMESTAMP,
          imported: 0
        })

        const maxBatchSize = 50;
        let importedFromFile = 0;
        const started = +new Date()
        let batchSize = 0;
        let batch = firestore.batch();
        const collection = "Person"
        const colRef = firestore.collection(`/tenants/${tenantId}/workspaces/${wid}/${collection}`)
        const dataStream = file.createReadStream()
        const parsePromise = new Promise((resolve, reject) => {
            
          dataStream
            .pipe(csv( optionsOrHeaders = {
                separator: importConfig.config.separator,
                skipComments: true,
            }

            ))
            .pipe(new Transform({
              objectMode: true,
              transform(data, encoding, next) {
                // console.log(`pipe:`, data);

                const {result} = processChunk(data, registry)
                console.log("Store result for key:",result.key)

                
                batch.set(colRef.doc(result.key), result.attributes)
                importedFromFile++

                const time = +new Date() - started
                

                if (++batchSize >= maxBatchSize) {
                  
                  console.debug("Do batch commit")
                  Promise.all([    
                    statRef.update({"imported": admin.database.ServerValue.increment(batchSize) }),
                    fileStatRef.update({
                      "imported": admin.database.ServerValue.increment(batchSize),
                      "timeMs": time,
                      "ratePerSec": importedFromFile / (time/1000)
                    }),
                    batch.commit()
                    .then((result)=>{
                      batch = admin.firestore().batch();
                      batchSize = 0;
                      
                      console.debug("Batch commit is done, pipe call, ", result.writeTime)
                    })
                ])
                .then(()=>{
                  console.debug("next data")
                  next(null, data)
                })  
                } else {
                  // console.debug("next")
                  next(null, data)
                }
              },
              final(next) {

                if(batchSize > 0) {
                  console.debug("pipe final, batchSize", batchSize, " wait for final batch commit")
                  Promise.all([                  
                    statRef.update({"imported": admin.database.ServerValue.increment(batchSize) }),
                    fileStatRef.update({
                      "imported": admin.database.ServerValue.increment(batchSize),
                      "endedAt": admin.database.ServerValue.TIMESTAMP }),
                    batch.commit()
                    .then(()=>{
                      console.debug("Batch commit is done, pipe is done")
                    })
                ]).then(()=>{
                  console.debug("final next")
                  next()
                })

                  
                } else {
                  console.debug("Pipe is done")
                  fileStatRef.update({
                    "endedAt": admin.database.ServerValue.TIMESTAMP 
                    }
                  )
                  .then(()=>{
                    console.debug("final next")
                    next()
                })
                }
              },      
            }
            
            ))
            .on("error", err => {
              console.error("import faield", err)
              reject(err)
            })    
            .on('end', ()=> {
              console.debug("end of stream")
              
            }) 
            .on('data', (chunk)=> {}) 
            .on('close', ()=> {
              console.log("data stream is closed")
              resolve(file)
            }) 
        })
        
        return parsePromise
            .then(file => {
                logger.debug("Deleting file after proccess") 
                return file.delete({ignoreNotFound: true })
            })
            .then(()=> logger.debug("Exit"))
            .catch( error => logger.debug("Error", error))
    } catch(e){
        console.log("Error", e)
    }
})