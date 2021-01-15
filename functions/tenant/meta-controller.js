const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { logger } = require('../firebase-service');

const handleCreate = async (snap, context) => {
    functions.logger.info('onCreate', snap.ref.path, context)
        
        const farfar = snap.ref.parent.parent
        await farfar.set( 
        {
            meta: {
                children: admin.firestore.FieldValue.arrayUnion(snap.ref.parent.id)
            }
        }, {merge: true})
        return true
}

const handleDelete = async (snap, context) => {
    functions.logger.info('onDelete', snap.ref.path, context)

        await snap.ref.parent.parent.set( 
            {
                meta: {
                    children: admin.firestore.FieldValue.arrayRemove(snap.ref.parent.id)
                }
            }, {merge: true})

        return null
}

const handleUpdates = async (change, context) => {
    functions.logger.info('onUpdate', change.after.id, context)
    if(change.before.isEqual(change.after)){
        return null
    }
    if( change.after.data().deleteMe && !change.before.data().deleteMe){
        deleteTree(change.after.ref)
    }
    return null
}
 
const deleteTree = (triggerDocumentRef) => {
    if (triggerDocumentRef.id === '_meta_'){
        const collectionRef = triggerDocumentRef.parent
        logger.info(`Delete collection ${collectionRef.id} and all children recursively`)
        collectionRef.parent.set({
            meta: {
                children: admin.firestore.FieldValue.arrayRemove(collectionRef.id)
            }
        }, { merge: true })
        deleteCollection(collectionRef)
    } else {
        logger.info(`Delete document ${triggerDocumentRef.id} and all children recursively`)
        deleteDocument(triggerDocumentRef)
    }
}

const deleteCollection = async (collection) => {
    /* eslint-disable no-await-in-loop*/
    let isDeleting = true
    while (isDeleting) {
        const docs = await collection.limit(100).get()
        if (docs.empty) {
            isDeleting = false
        } else {
            docs.forEach(async doc => await deleteDocument(doc.ref))
        }
    }
    /* eslint-enable no-await-in-loop */
}

const deleteDocument = async (document) => {
    const children = await document.listCollections()
    children.forEach(collection => {
        deleteCollection(collection)
    });
    await document.delete()
}


const levelPath = (level) => 
        [...Array(level)].map( (_, i)=>`{c${i+1}}/{d${i+1}}`).join('/')

exports.levelPath = levelPath
 
exports.pathForLevel = (params, level) => {
    const thingPath = [...Array(level)].map( (_, i)=>`${params[`c${i+1}`]}/${params[`d${i+1}`]}`).join('/')
    return `tenants/${params.tenantId}/workspaces/${params.wid}${thingPath ? `/${thingPath}`: ''}`
}

exports.onCreateLevel1 = functions.firestore
    .document(`tenants/{tenantId}/workspaces/{wid}/${levelPath(1)}`)
    .onCreate( async (snap, context) => {
        functions.logger.info('onCreate', snap.ref.path, context)
        
        const farfar = snap.ref.parent.parent
        await farfar.set( 
        {
            meta: {
                children: admin.firestore.FieldValue.arrayUnion(snap.ref.parent.id)
            }
        }, {merge: true})
        return true
    });


exports.onDeleteLevel1 = functions.firestore
    .document(`tenants/{tenantId}/workspaces/{wid}/${levelPath(1)}`)
    .onDelete( async (snap, context) => {
        functions.logger.info('onDelete', snap.ref.path, context)

        await snap.ref.parent.parent.set( 
            {
                meta: {
                    children: admin.firestore.FieldValue.arrayRemove(snap.ref.parent.id)
                }
            }, {merge: true})

        return null
    });

exports.onUpdateLevel1 = functions.firestore
    .document(`tenants/{tenantId}/workspaces/{wid}/${levelPath(1)}`)
    .onUpdate((change, context) => {
        functions.logger.info('onUpdate', change.after.id, context)
        if(change.before.isEqual(change.after)){
            return null
        }
        if( change.after.data().deleteMe && !change.before.data().deleteMe){
            deleteTree(change.after.ref)
        }
        return null
    });

exports.onCreateLevel2 = functions.firestore.document(`tenants/{tenantId}/workspaces/{wid}/${levelPath(2)}`).onCreate( handleCreate );
exports.onDeleteLevel2 = functions.firestore.document(`tenants/{tenantId}/workspaces/{wid}/${levelPath(2)}`).onDelete( handleDelete );
exports.onUpdateLevel2 = functions.firestore.document(`tenants/{tenantId}/workspaces/{wid}/${levelPath(2)}`).onUpdate( handleUpdates )
