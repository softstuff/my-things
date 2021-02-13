const fs = require('../firebase-service');
const { auditLogger } = require('./logger')
const short = require('short-uuid');

const createTenant = async (req, res) => {
    fs.logger.info('Call to createTenant user', req.authId, req.authClaims)

    try {
        if ( req.authClaims.tenantId) {
            return res.status(412).send("user allready has a tenantId connected")
        }

        const tenantId = short.generate()


        let myThings = req.authClaims.myThings || {}
        myThings.tenantId = tenantId
        myThings.admin = true
        const newClaim = {myThings}

        fs.logger.debug("Set new custom user claims", req.authId, newClaim)
        await fs.auth.setCustomUserClaims(req.authId, newClaim)
        
        const tenantData = {
            meta: {
                owner: req.authId
            }
        }
        console.log('Creating tenant  ', tenantId, tenantData)
        const tenant = await fs.firestore.collection("tenants").doc(tenantId).set(tenantData)

        console.log('Creating logs collection')
        await fs.firestore.collection(`tenants/${tenantId}/logs`).add({})

        console.log('Creating default workspace')
        await fs.firestore.doc(`tenants/${tenantId}/workspaces/default`).set({})

        
        auditLogger(tenantId, `Created a new tenant for user ${req.authId}`,201, null, req)
        return res.status(201).json({ tenantId })
    } catch(error){
        fs.logger.error('Failed to create tenant', error)
        return res.status(500)
    }
}


module.exports = {
        createTenant,
        auditLogger
    }