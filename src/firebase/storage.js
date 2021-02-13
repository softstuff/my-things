//@flow
import { firestore } from "./config"
import firebase from 'firebase/app'

const metaDocumentName = "_meta_"

const metaTag = "meta"


export const getDocument = (tenantId, wid, collectionPath, documentId, onLoaded, onError) => {
    const path = `${getWorkspacePath(tenantId, wid)}${collectionPath}/${documentId}`
    console.log('getDocument', path)
    return firestore.doc(path).onSnapshot(async (snapshot) => {

        if (snapshot.exists) {
            console.log('Loaded data: ', snapshot.data())
            const loaded = { id: snapshot.id, ...snapshot.data() }
            onLoaded(loaded)
        } else {
            onLoaded()
        }
    }, (error) => {
        onError(error)
        console.log(`Error reading ${path}`, error)
    })
}

export const updateThing = async (tenantId, wid, collectionPath, documentId, thing) => {
        const path = getDocPath(tenantId, wid, collectionPath, documentId)
        console.log('updateDocument', path, thing)
        await firestore.doc(path).update({thing})
        console.log('Updated successfully')
}


export const createDocument = async (tenantId, wid, collectionId, documentId) => {
    
    const path = getCollectionPath(tenantId, wid, collectionId, documentId)
    console.log('createDocument', path, documentId)
    await firestore.collection(path).doc(documentId).set({
        meta:{
            id: documentId,
            children: []
        },
        thing: {}
    })
}

export const addNewCollection = async (tenantId, wid, collectionId) => {
    const path = getWorkspacePath(tenantId, wid)

    console.log('Adding new collection',collectionId, 'to', path)
    const docRef = firestore.doc(path)
    const colRef = docRef.collection(collectionId)
    const metaRef = colRef.doc(metaDocumentName)

    if(colRef.exists){
        new Error(`Collection ${collectionId} already exists`)
    }
    
    await metaRef.set( {
        created: firebase.firestore.FieldValue.serverTimestamp()
    })

    const parentMetaRef = await docRef.get()
    console.log('parentMetaRef', parentMetaRef.exists, parentMetaRef.data(), parentMetaRef.data() || 'not found' )
    const parentMetaData = parentMetaRef.data()
    // const meta = parentMetaData[metaTag] || {}
    // let children = meta.children || {}
    parentMetaData[metaTag] = {
        children: firebase.firestore.FieldValue.arrayUnion(colRef.id)
    }
    // meta.children = children
    // parentMetaData.meta = meta
    await docRef.set(parentMetaData, { merge: true })

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
    }, ()=> console.log('getWorkspaces complete'))
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

export const removeWorkspace = async (tenantId, wid) => {
    
    const ref = await firestore.doc(`tenants/${tenantId}/workspaces/${wid}`)
    await ref.delete()
    console.log(`Workspace ${wid} was removed`)
   
    return ref.id
}

export const getLevelInfo = (tenantId, wid, levelPath, onLoad, onError) => {

    const path = `${getWorkspacePath(tenantId, wid)}${levelPath}`
    console.log('getLevelInfo', path)
    return firestore.doc(path).onSnapshot(snap => {
        if (snap.exists) {
                console.log('getLevelInfo loaded', snap.data())
                onLoad( snap.data().meta)
            } else {
                console.log('getLevelInfo do not exists')
                onLoad()
            }
        }, error => onError(error)
    )
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


export const listDocuments = async (tenantId, wid, collectionPath, onLoaded, onError) => {
    if(!collectionPath){
        console.log('No collection id found, ')
        onLoaded([])
        return null
    }
    const path = getCollectionPath(tenantId, wid, collectionPath)

    return firestore.collection(path).onSnapshot(
        snap => {
            console.log('listDocuments', path, snap.size)
            onLoaded(snap.docs.map(doc => doc.id).filter(id=>id !== metaDocumentName))
        },
        error => onError(error))
}


export const usageOf = (tenantId, wid, pointer) =>  {
    return []
}

const getWorkspacePath = (tenantId, wid) => `tenants/${tenantId}/workspaces/${wid}`
const getCollectionPath = (tenantId, wid, collectionPath) => `${getWorkspacePath(tenantId, wid)}${collectionPath}`
const getDocPath = (tenantId, wid, collectionPath, doc) => `${getCollectionPath(tenantId, wid, collectionPath)}/${doc}`
