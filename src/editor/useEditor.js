import React, {useContext, useEffect, useState} from "react"
import { useWorkspace } from "../components/workspace/useWorkspace"
import { subscribeDocument } from "../firebase/storage";


export const EditorContext = React.createContext()

export const useEditor = () => {
    const context = useContext(EditorContext)
    return { ...context}
}


export const EditorProvider = (props) => {

    const [editing, setEditing] = useState(false)
    const [collectionId, setCollectionId] = useState()
    const [documentId, setDocumentId] = useState()
    const [document, setDocument] = useState()
    const [createCollection, setCreateCollection] = useState(false)
    const [createDocument, setCreateDocument] = useState(false)

    const {tenantId, wid,} = useWorkspace()

    useEffect(()=>{
        let mounted = true
        const unsubscribe = subscribeDocument(tenantId, wid, collectionId, documentId,
            ({id, loaded}) => {
                if(!mounted) {
                    console.log("document", documentId, "is not mounted")
                    unsubscribe()
                    return 
                }
                
                if (loaded) {
                    console.log("loaded document", id, loaded)
                    setDocument(loaded)
                } else {
                    console.log("document", documentId, "was not found")
                }
            },
            (error) => {
                console.log("Error while loading document ", documentId, "cause", error)
            })
        return ()=>{
            mounted = false
            unsubscribe()
        }
    }, [documentId])

    return (
        <EditorContext.Provider value={{
            editing, setEditing,
            collectionId, setCollectionId,
            createCollection, setCreateCollection,
            documentId, setDocumentId,
            document, setDocument,
            createDocument, setCreateDocument
        }} >
            {props.children}
        </EditorContext.Provider>
    )
}