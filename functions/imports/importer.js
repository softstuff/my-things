const functions = require('firebase-functions');
const admin = require('firebase-admin');
const csv = require('csv-parser');
const { firestore, database } = require('../firebase-service');
const { Transform, Stream, Writable } = require('stream');

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
        console.error(error)
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

  return new Transform({
    objectMode: true,
    async transform(result, encoding, next) {
      console.log("store stream chunk")
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
      console.log("store stream done")
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

    const time = Math.round((Number(new Date()) - startTime) / 1000)
    
    console.log(`Got ${now} last ${Math.round(rate/1000)} sec, total ${current} for the last ${time} sec`)
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
      console.log("stat stream chunk")
      perIteration++;
      return next(null, chunk)
    },
    async final (next) {
      console.log("stat stream done")
      clearInterval(timer)
      current += perIteration
      console.log(`Got total ${current} for during ${ Math.round((Number(new Date()) - startTime) / 1000) } seconds`)

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
      console.log(`delay stream for ${delayInMs} ms`)
      await delay(delayInMs)
      return next(null, chunk)
    }
  })

}

exports.imports = functions
  // .runWith(runtimeOpts)
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

      const maxBatchSize = 500;
      let importedFromFile = 0;
      const started = Number(new Date())
      let batchSize = 0;
      let batch = firestore.batch();
      const collection = "Person"
      const collectionRef = firestore.collection(`/tenants/${tenantId}/workspaces/${wid}/${collection}`)
      const validation = process.env.NODE_ENV === 'development' ? false : 'crc32c'
      const dataStream = file.createReadStream({validation})
      const parsePromise = new Promise((resolve, reject) => {

        dataStream
          
          .pipe(csv(optionsOrHeaders = {
            separator: importConfig.config.separator,
            skipComments: true,
          }))
          .pipe(delayStream({delayInMs: 500}))
          .pipe(transformCsvToObject({importConfig}))
          .pipe(storeStream({collectionRef, maxBatchSize}))
          .pipe(statStream({statRef, fileStatRef}))
          
          // .pipe(new Transform({
          //   objectMode: true,
          //   transform(result, encoding, next) {

          //     batch.set(colRef.doc(result.key), result.attributes)
          //     importedFromFile++
          //     const time = Number(new Date()) - started
          //     if (++batchSize >= maxBatchSize) {

          //       logger.debug("Do batch commit")
          //       return Promise.all([
          //         statRef.update({ "imported": admin.database.ServerValue.increment(batchSize) }),
          //         fileStatRef.update({
          //           "imported": admin.database.ServerValue.increment(batchSize),
          //           "timeMs": time,
          //           "ratePerSec": importedFromFile / (time / 1000)
          //         }),
          //         batch.commit()
          //           .then((result) => {
          //             batch = admin.firestore().batch();
          //             batchSize = 0;

          //             logger.debug("Batch commit is done")
          //             return result
          //           })
          //           .catch(error => {
          //             next(error)
          //           })
          //       ])
          //         .then(() => {
          //           return next(null, result)
          //         })
          //         .catch(error => {
          //           return next(error)
          //         })
                  
          //     } else {
          //       return next(null, result)
          //     }
          //   },
          //   final(next) {
          //     if (batchSize > 0) {
          //       logger.debug("pipe final, batchSize", batchSize, " wait for final batch commit")
          //       return Promise.all([
          //         statRef.update({ "imported": admin.database.ServerValue.increment(batchSize) }),
          //         fileStatRef.update({
          //           "imported": admin.database.ServerValue.increment(batchSize),
          //           "endedAt": admin.database.ServerValue.TIMESTAMP
          //         }),
          //         batch.commit()
          //           .then(() => {
          //             logger.debug("Batch commit is done, pipe is done")
          //             return
          //           })
          //           .catch(error => {
          //             console.log("Next Error E", error)
          //             next(error)
          //           })
          //       ])
          //       .then(() => {
          //         logger.debug("final next")
          //         return next()
          //       })
          //       .catch(error => {
          //         console.log("Next Error E", error)
          //         next(error)
          //       })


          //     } else {
          //       logger.debug("Pipe is done")
          //       return fileStatRef.update({
          //         "endedAt": admin.database.ServerValue.TIMESTAMP
          //       })
          //       .then(() => {
          //         logger.debug("final next")
          //         return next()
          //       })
          //       .catch(error => {
          //         next(error)
          //       })
          //     }
          //   },
          // }

          // ))
          .on("error", err => {
            logger.error("import faield", err)
            reject(err)
          })
          .on('end', () => {
            logger.debug("end of stream")

          })
          .on('data', (chunk) => { console.log("Data")})
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