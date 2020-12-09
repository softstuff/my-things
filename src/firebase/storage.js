//@flow
import { firestore } from "./config"

export const getDocument = (path, onLoaded, onError) => {
    return firestore.doc(path).onSnapshot(async (snapshot) => {
        if (snapshot.exists) {
            const loaded = snapshot.data()
            onLoaded(loaded)
        }
    }, (error) => {
        onError(error)
        console.log(`Error reading ${path}`, error)
    })
}

export const updateDocument = async (path, doc, onSuccess, onFailed) => {
    try {
        await firestore.doc(path).update(doc)
        onSuccess()
    } catch(error) {
        onFailed(error)
    }
}

export const addCollection = async (path, name) => {
        const docRef = firestore.doc(path)
        const colRef = docRef.collection(name)
        if( colRef.exists ) {
            throw Error(`Collection ${name} is already existing`)
        } else {
            console.log('Adding new collection')
            const newDocRef = await colRef.doc('meta')
            console.log('Temp doc ', newDocRef.id, ' was created')
            await newDocRef.set({})
            const doc = (await docRef.get()).data()
            console.log('got doc', doc)
            doc.meta.children = doc?.meta?.children || []
            doc.meta.children.push(name)
            console.log('update meta children ref', doc)
            await docRef.update({ meta: doc.meta })
        }

}

export const deleteCollection = async (path, name) => {
    console.log('Delete collection', path, name)
    const docRef = firestore.doc(path)
    const colRef = docRef.collection(name)

    const collection = await colRef.get()
    collection.forEach( async (snapshot) =>  {
        await snapshot.ref.delete()
    })

    const doc = (await docRef.get()).data()
    console.log('got doc', doc)
    doc.meta.children = doc?.meta?.children || []
    const index = doc.meta.children.indexOf(name)
    if( index > -1) {
        console.log('Delete child index', index, 'from', doc.meta)
        doc.meta.children.splice(index, 1)
        console.log('update meta children ref', doc, doc.meta)
        await docRef.update({ meta: doc.meta })
    }

}