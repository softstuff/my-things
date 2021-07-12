const functions = require('firebase-functions');
const admin = require('firebase-admin');
const csv = require('csv-parser');
const { firestore, database } = require('../firebase-service');
const pipeline = require('stream')
// const pipeline = require('stream').promises;
const { Transform, Writable } = require('stream');
const logger = functions.logger

const isEdge = element => {
  return 'target' in element
}

const isNode = element => {
  return !isEdge(element)
}

const buildRegistry = (mapping) => {

  return {
    inputSelectorToInputNode: mapping.elements.filter(e => e.type === "input").reduce((map, current) => {
      map[current.data.label] = current.id
      return map
    }, {})
    ,
    outputNodes: mapping.elements.filter(e => e.type === "attribute"),
    keyNodeId: mapping.elements.find(e => e.type === "collectionKey")?.id
    ,
    nodeIdToNode: mapping.elements.filter(isNode).reduce((map, current) => {
      map[current.id] = current
      return map
    }, {})
    ,
    nodeIdToEdges: mapping.elements.filter(isEdge).reduce((map, current) => {
      if (!map[current.source]) {
        map[current.source] = []
      }
      map[current.source].push(current)
      return map
    }, {})
  }
}

const processChunk = (chunk, registry) => {
  let payload = { ...chunk }

  Object.keys(registry.inputSelectorToInputNode)
    .forEach(inputSelector => {
      const inputNodeId = registry.inputSelectorToInputNode[inputSelector]
      payload[inputNodeId] = payload[inputSelector]
      const edges = registry.nodeIdToEdges[inputNodeId]
      pushIt({ edges, payload, registry })
    })
  const key = registry.keyNodeId ? payload[registry.keyNodeId] : "not set"
  const attributes = registry.outputNodes.reduce((map, current) => {
    map[current.data.label] = payload[current.id]
    return map
  }, {})
  return { result: { key, attributes }, payload }
}

const pushIt = ({ edges, payload, registry }) => {

  edges?.forEach(edge => {
    const node = registry.nodeIdToNode[edge.target]

    const nodeArgs = { edge, payload, registry }
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
      pushIt({ edges: nextEdges, payload, registry })
    }

  });
}

const processOutputNode = ({ edge, payload, registry }) => {
  payload[edge.target] = payload[edge.source]
}

const processOutputIdNode = ({ edge, payload, registry }) => {
  payload[edge.target] = payload[edge.source]
}

const processActionLowerNode = ({ edge, payload, registry }) => {
  payload[edge.target] = payload[edge.source].toString().toLowerCase()
}

const processActionUpperNode = ({ edge, payload, registry }) => {
  payload[edge.target] = payload[edge.source].toString().toUpperCase()
}

const processActionJoinNode = ({ edge, payload, registry }) => {

  const joinNode = registry.nodeIdToNode[edge.target]
  const outerHandle = edge.targetHandle === "a" ? "b" : "a"
  payload[`${edge.target}_${edge.targetHandle}`] = payload[edge.source]

  if (payload[`${edge.target}_${outerHandle}`]) {
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

const transformCsvToObject = ({importConfig}) => {
  const registry = buildRegistry(importConfig.mapping)

  return new Transform({
    objectMode: true,
    transform(data, encoding, next) {
      try {
        const { result } = processChunk(data, registry)
        return next(null, result)
      } catch(error) {
        logger.error(error)
        return next(error, null)
      }
    }
  })
}

const storeStream = ({collectionRef, maxBatchSize}) => {
  let batch = firestore.batch();
  let batchSize = 0
  
  const commit = async () => {
    await batch.commit()
    batch = admin.firestore().batch();
    batchSize = 0;
  }

  return new Writable({
    objectMode: true,
    async write(result, encoding, next) {
      batch.set(collectionRef.doc(result.key), result.attributes)
      if (++batchSize >= maxBatchSize) {
        try{
          logger.debug("Do batch commit")
          await commit()
          return next(null, result)
        } catch(error) {
          return next(error)
        }
      }
      return next(null, result)
    },
    async final (next) {
      if (batchSize > 0) {
        try{
          logger.debug("Do final batch commit")
          await commit()
        } catch(error) {
          return next(error)
        }
      }
      logger.debug("Store finished")
      return next()
    }  
  })
}



const statStream = ({statRef, fileStatRef}) => {
  let current = 0;
  let perIteration = 0;
  let rate = 1000
  const startTime = Number(new Date())

  const timer = setInterval(async () => { 
    const now = perIteration
    perIteration = 0
    current += now
    const time = Number(new Date()) - startTime    
    logger.debug(`Got ${now} last ${Math.round(rate/1000)} sec, total ${current} for the last ${time/1000} sec`)
    try{
      await Promise.all([
      statRef.update({ "imported": admin.database.ServerValue.increment(now) }),
      fileStatRef.update({
        "imported": admin.database.ServerValue.increment(now),
        "timeSec": time,
        "ratePerSec": current / time
      })
    ])
    } catch(error) {
      logger.warn("Failed to store stats", error)
    }
    
  }, rate);

  return new Transform({
    objectMode: true,
    transform(chunk, encoding, next) {
      perIteration++;
      return next(null, chunk)
    },
    async final (next) {
      clearInterval(timer)
      current += perIteration
      const time = ((Number(new Date()) - startTime)/1000).toFixed(2)
      logger.debug(`Got total ${current} for during ${time} sec`)

      try {
        await Promise.all([
          statRef.update({ "imported": admin.database.ServerValue.increment(perIteration) }),
          fileStatRef.update({
            "imported": admin.database.ServerValue.increment(perIteration),
            "endedAt": admin.database.ServerValue.TIMESTAMP
          })
        ])
      } catch(error) {
        logger.warn("Failed to store final stats", error)
      }
      logger.debug("Stat finished")
      return next()
    }  
  })
}

const delayStream = ({delayInMs}) => {  

  delay = delayInMs => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(2);
      }, delayInMs);
    });
  }

  return new Transform({
    objectMode: true,
    async transform(chunk, encoding, next) {
      
      if (delayInMs > 0) {
        logger.debug(`delay stream for ${delayInMs} ms`)
        await delay(delayInMs)
      }
      return next(null, chunk)
    }
  })

}

exports.imports = functions
  .runWith(runtimeOpts)
  .storage
  .bucket()
  .object()
  .onFinalize(async (object, context) => {

    const file = admin.storage().bucket(object.bucket).file(object.name)

    try {
      const { tenantId, wid, iid, batchId = Number(new Date()) } = object.metadata
      const workspaceDocPath = `/tenants/${tenantId}/workspaces/${wid}`

      const workspaceSnap = await firestore.doc(workspaceDocPath).get()
      const importConfig = workspaceSnap.get(`imports.${iid}`)
      
      const fileName = file.name.split("/")[4]
      logger.info("Uploaded filename", fileName, "tenantId", tenantId, "workspace", wid, "import config id", iid, "batchId", batchId)


      const statRef = database.ref(`${tenantId}/${wid}/imports/${iid}/${batchId}`)

      const statSnap = await statRef.get()
      if (!statSnap.exists()) {
        statRef.set({
          startedAt: admin.database.ServerValue.TIMESTAMP,
          imported: 0,
          failed: 0
        })
      }


      const files = statRef.child("files")
      var i = 0
      var fileStatRef = files.child(encodeKey(fileName))
      /*eslint-disable-next-line no-await-in-loop*/
      while (++i < 1000 && (await fileStatRef.get()).exists()) {
        fileStatRef = files.child(`${encodeKey(fileName)}_${i}`)
      }
      await fileStatRef.set({
        startedAt: admin.database.ServerValue.TIMESTAMP,
        imported: 0
      })

      const maxBatchSize = 100;
      const collection = "Person"
      const collectionRef = firestore.collection(`/tenants/${tenantId}/workspaces/${wid}/${collection}`)
      const validation = process.env.NODE_ENV === 'development' ? false : 'crc32c'
      
      const parsePromise = new Promise((resolve, reject) => {

        file.createReadStream({validation})
          .pipe(csv(optionsOrHeaders = {
            separator: importConfig.config.separator,
            skipComments: true,
          }))
          // .pipe(delayStream({delayInMs: process.env.NODE_ENV === 'development' ? 500 : 0}))
          .pipe(transformCsvToObject({importConfig}))
          .pipe(statStream({statRef, fileStatRef}))
          .pipe(storeStream({collectionRef, maxBatchSize}))
          
          .on("error", err => {
            logger.error("import faield", err)
            reject(err)
          })
          .on('end', () => logger.debug("end of stream"))
          .on('close', () => {
            logger.debug("data stream is closed")
            resolve(file)
          })

      })

      logger.debug("Await import to complete")
      await parsePromise
      logger.debug("Import is done")
      
    } catch (e) {
      logger.error("Error", e)
      
    } finally {
      await file.delete({ ignoreNotFound: true })
      logger.debug("Uploade file was deleted successful - Exit")
    }

  })