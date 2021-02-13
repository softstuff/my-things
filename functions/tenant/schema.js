const { logger, firestore} = require('../firebase-service');

const getSchema = async (req, res) => {
    logger.info('Call to getSchema user', req.authId, req.authClaims)

    try {
        const {tenantId, wid } = req.params 
        const path = req.path.slice(`/api/schema/${tenantId}/${wid}/`.length, req.path.length - '.json'.length)
        console.log('path', req.params, path)
        console.log('Read: ', `tenants/${tenantId}/workspaces/${wid}/${path}/_meta_`)
            // /tenants/pPGyqMRWxYh8DZ5tDhsChg/workspaces/default/Skola/_meta_
        const metaRef = await firestore.doc(`tenants/${tenantId}/workspaces/${wid}/${path}/_meta_`).get()
        // const metaRef = await firestore.doc(`tenants/pPGyqMRWxYh8DZ5tDhsChg/workspaces/default/Skola/_meta_`).get()

        const meta = metaRef.data()
        console.log('meta:', meta, metaRef.exists, metaRef.id)
        
        return res.status(200).json(meta.schema)
        // return res.status(200).json({})
    } catch(error){
        logger.error('Failed to find json schema ', error)
        return res.status(500)
    }
}


module.exports = {
    getSchema
}