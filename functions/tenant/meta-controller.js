const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { logger } = require('../firebase-service');
 
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


exports.onCreateLevel1 = functions.firestore
    .document(`tenants/{tenantId}/workspaces/{wid}/{collectionId}/{documentId}`)
    .onCreate( async (snap, context) => {
        functions.logger.info('onCreate', snap.ref.path, context)
        
        return true
    });


exports.onDeleteLevel1 = functions.firestore
    .document(`tenants/{tenantId}/workspaces/{wid}/{collectionId}/{documentId}`)
    .onDelete( async (snap, context) => {
        functions.logger.info('onDelete', snap.ref.path, context)
        return null
    });

exports.onUpdateLevel1 = functions.firestore
    .document(`tenants/{tenantId}/workspaces/{wid}/{collectionId}/{documentId}`)
    .onUpdate((change, context) => {
        functions.logger.info('onUpdate', change.after.id, context)
        
        return null
    });

// exports.onCreateLevel2 = functions.firestore.document(`tenants/{tenantId}/workspaces/{wid}/${levelPath(2)}`).onCreate( handleCreate );
// exports.onDeleteLevel2 = functions.firestore.document(`tenants/{tenantId}/workspaces/{wid}/${levelPath(2)}`).onDelete( handleDelete );
// exports.onUpdateLevel2 = functions.firestore.document(`tenants/{tenantId}/workspaces/{wid}/${levelPath(2)}`).onUpdate( handleUpdates )
