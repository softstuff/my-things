import {useCallback} from "react"
import {useUser} from "../components/user/useUser"
import {useWorkspace} from "../components/workspace/useWorkspace"
import {addCollectionImport, createThing, deleteWorkspaceField, saveSchema, subscribeOnSchema, usageOf} from "./storage"


export const useStorage = () => {
    const { wid } = useWorkspace()
    const { tenantId } = useUser()
    
    const loadSchema = useCallback( (onLoad, onError) => subscribeOnSchema(tenantId, wid, onLoad, onError), [tenantId, wid])
    const saveSchemaCallback = useCallback( (schema) => saveSchema(tenantId, wid, schema), [tenantId, wid])
    const usageOfCallback = useCallback( (pointer) => usageOf(tenantId, wid, pointer), [tenantId, wid])
    const deleteWorkspaceFieldCallback = useCallback( (field) => deleteWorkspaceField(tenantId, wid, field), [tenantId, wid])
    const addCollectionImportCallback = useCallback( (importConfig) => addCollectionImport(tenantId, wid, importConfig), [tenantId, wid])
    const addObjectCallback = useCallback( (collectionId, objectId, objectToAdd) => createThing(tenantId, wid, collectionId, objectId, objectToAdd), [tenantId, wid])

    return {
        loadSchema,
        saveSchema: saveSchemaCallback,
        usageOf: usageOfCallback,
        deleteWorkspaceField: deleteWorkspaceFieldCallback,
        addCollectionImport: addCollectionImportCallback,
        addObject: addObjectCallback
    }
}