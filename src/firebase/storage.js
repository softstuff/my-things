//@flow
import {firestore} from "./config"
import firebase from 'firebase/app'
import { nanoid } from "nanoid"

const metaDocumentName = "_meta_"

export const subscribeDocument = (tenantId, wid, collectionId, documentId, onLoaded, onError) => {
    const path = `${getWorkspacePath(tenantId, wid)}/${collectionId}/${documentId}`
    console.log('subscribeDocument', path)
    return firestore.doc(path).onSnapshot(async (snapshot) => {

        if (snapshot.exists) {
            const loaded = snapshot.data()
            console.log('Loaded data: ', loaded)
            onLoaded({ id: snapshot.id, loaded})
        } else {
            onLoaded({})
        }
    }, (error) => {
        onError(error)
        console.log(`Error reading ${path}`, error)
    })
}

export const updateThing = (tenantId, wid, collectionId, documentId, thing) => {
        const path = `${getWorkspacePath(tenantId, wid)}/${collectionId}/${documentId}`
        console.log('updateThing', path, thing)
        const docRef = firestore.doc(path)
        return docRef.update(thing)
            .then(() => {
                console.log("Document successfully updated!");
            })
            .catch((error) => {
                // The document probably doesn't exist.
                console.error("Error updating document: ", error);
            })
}

export const updateFields = (tenantId, wid, collectionId, documentId, key, value) => {
    const path = `${getWorkspacePath(tenantId, wid)}/${collectionId}/${documentId}`
    
    console.log('updateFields', path, key, value)
    const docRef = firestore.doc(path)
    return docRef.update(key, value)
        .then(() => {
            console.log("Document successfully updated!");
        })
        .catch((error) => {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        })
}


export const deleteField = (tenantId, wid, collectionId, documentId, key) => {
    const path = `${getWorkspacePath(tenantId, wid)}/${collectionId}/${documentId}`
    
    console.log('deleteField', path, key)
    const docRef = firestore.doc(path)
    return docRef.update({
            [key]: firebase.firestore.FieldValue.delete()
        })
        .then(() => {
            console.log("Document successfully updated!");
        })
        .catch((error) => {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        })
}

export const createThing = async (tenantId, wid, collectionId, documentId, thing) => {
    
    const path = `${getWorkspacePath(tenantId, wid)}/${collectionId}`

    console.log('createThing', path, documentId, thing)
    if (documentId) {
        const result = await firestore.collection(path).doc(documentId).set(thing)
        return result.id
    } else {
        const result = await firestore.collection(path).add(thing)
        return result.id
    }
}

export const addNewCollection = async (tenantId, wid, collectionId) => {
    const workspacePath = getWorkspacePath(tenantId, wid)

    console.log('Adding new collection',collectionId, 'to', workspacePath)
    const wsRef = firestore.doc(workspacePath)
    
    const ws = await wsRef.get()
    const wsData = ws.data()
    console.log('wsData', ws.exists, wsData)
    // const meta = parentMetaData[metaTag] || {}
    // let children = meta.children || {}
    wsData.collections =  firebase.firestore.FieldValue.arrayUnion(collectionId)

    // meta.children = children
    // parentMetaData.meta = meta
    await wsRef.set(wsData, { merge: true })

    console.log('Added new collection', collectionId )
}


export const deleteCollection = async (tenantId, wid, path) => {
    console.log('Delete collection', path)
    const ws = getWorkspacePath(tenantId, wid)
    const docRef = firestore.doc(`${ws}/${path}/${metaDocumentName}`)
    docRef.set({ deleteMe:true}, {merge:true})
    console.log('Collection ', path, 'is marked for deletion')
}


export const addSubCollection = async (tenantId, wid, collectionPath, documentId, addChildNamed) => {
    const path = getDocPath(tenantId, wid, collectionPath, documentId)
    console.log('addSubCollection ', path, addChildNamed) 
    const docRef = firestore.doc(path).collection(addChildNamed).doc(metaDocumentName)
    await docRef.set({
        children: {}
    })
}

export const loadWorkspace = (tenantId, wid, onLoaded, onError) => {
    
    return firestore.doc(getWorkspacePath(tenantId, wid)).onSnapshot( (snap) => {
        if(snap.exists) {
            onLoaded(snap.data())
        } 
    }, (error) => {
        onError(error)
        console.log(`Error reading workspace ${wid} for tenant: ${tenantId}`, error)
    })
}

export const getWorkspaceIdList = (tenantId, onLoaded, onError) => {
    
    return firestore.collection(`tenants/${tenantId}/workspaces`).onSnapshot( (snap) => {
        let ids = []
        snap.forEach( doc => {
            ids.push(doc.id)
        })
        onLoaded(ids)
    }, (error) => {
        onError(error)
        console.log(`Error reading workspaces for tenant: ${tenantId}`, error)
    })
}

export const getWorkspaces = (tenantId, onLoaded, onError) => {
    
    return firestore.collection(`tenants/${tenantId}/workspaces`).onSnapshot( (snapshot) => {
        let workspaces = []
        if(!snapshot.empty) {
            snapshot.forEach( doc => {
                workspaces.push({id: doc.id, ...doc.data() })
            })
        } else {
            console.log('Has no workspaces on', snapshot)
        }
        onLoaded(workspaces)
    }, (error) => {
        onError(error)
        console.log(`Error reading workspaces for tenant: ${tenantId}`, error)
    }, ()=> console.log('getWorkspaces complete'))
}


export const createWorkspace = async (tenantId, title, description) => {
    
    const ref = await firestore.collection(`tenants/${tenantId}/workspaces`).doc(title).set({
        title,
        description
    })
    console.log('createWorkspace ', ref.id)
    return ref.id
}

export const updateWorkspace = async (tenantId, wid, description) => {
    
    await firestore.doc(`tenants/${tenantId}/workspaces/${wid}`).set({
        description
    }, {merge: true})
    console.log('updateWorkspace ', wid)
}

export const deleteWorkspaceField = (tenantId, wid, field) => {
    const path = `${getWorkspacePath(tenantId, wid)}`
    
    console.log('deleteWorkspaceField', path, field)
    const docRef = firestore.doc(path)
    return docRef.update({
            [field]: firebase.firestore.FieldValue.delete()
        })
        .then(() => {
            console.log("Document successfully updated!");
        })
        .catch((error) => {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        })
}

export const removeWorkspace = async (tenantId, wid) => {
    
    const ref = await firestore.doc(`tenants/${tenantId}/workspaces/${wid}`)
    await ref.delete()
    console.log(`Workspace ${wid} was removed`)
   
    return ref.id
}

// export const getWorkspace = (tenantId, wid, onLoad, onError) => {

//     const path = `${getWorkspacePath(tenantId, wid)}/`
//     console.log('getCollections', path)
//     return firestore.doc(path).onSnapshot(snap => {
//         if (snap.exists) {
//                 console.log('getLevelInfo loaded', snap.data())
//                 onLoad( snap.data().meta)
//             } else {
//                 console.log('getLevelInfo do not exists')
//                 onLoad()
//             }
//         }, error => onError(error)
//     )
// }

export const addCollectionImport = async (tenantId, wid, importConfig) => {
    const configId = nanoid(4)
    const pointer = `imports.${configId}`
    await firestore.doc(`tenants/${tenantId}/workspaces/${wid}`).update({
        [pointer]: importConfig
    })
    return configId
}

export const subscribeOnSchema = async (tenantId, wid, onLoaded, onError) => {

    const path = getWorkspacePath(tenantId, wid)
    console.log('getSchema',path)
    return firestore.doc(path).onSnapshot(
        snap => {
            onLoaded(snap.data().schema)
        }, error => {
            onError(error)
        }
    )
}

export const saveSchema = (tenantId, wid, schema) => {

    const path = getWorkspacePath(tenantId, wid)
    console.log('saveSchema',path, schema)
    return firestore.doc(path).update( {schema})
}

export const getSchema = async (tenantId, wid, collectionPath, onLoaded, onError) => {

    const path = getDocPath(tenantId, wid, collectionPath, metaDocumentName)
    console.log('getSchema',path)
    return firestore.doc(path).onSnapshot(
        snap => {
            onLoaded(snap.data().schema)
        }, error => {
            onError(error)
        }
    )
}


export const listDocuments = (tenantId, wid, collectionId, onLoaded, onError) => {
    if(!collectionId){
        console.log('No collection id found, ')
        onLoaded([])
        return null
    }
    const path = `${getWorkspacePath(tenantId, wid)}/${collectionId}`

    return firestore.collection(path).get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                onLoaded({})
            } else {
                const docs = querySnapshot.docs.map(doc => ({ id:doc.id, doc:doc.data()}))
                console.log('Loaded data: ', docs)
                onLoaded(docs)
            }
        })
        .catch( error => onError(error))

}


export const usageOf = (tenantId, wid, pointer) =>  {
    return []
}

const getWorkspacePath = (tenantId, wid) => `tenants/${tenantId}/workspaces/${wid}`
const getCollectionPath = (tenantId, wid, collectionPath) => `${getWorkspacePath(tenantId, wid)}${collectionPath}`
const getDocPath = (tenantId, wid, collectionPath, doc) => `${getCollectionPath(tenantId, wid, collectionPath)}/${doc}`
