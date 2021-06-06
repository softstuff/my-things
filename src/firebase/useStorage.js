import {useCallback} from "react"
import {useUser} from "../components/user/useUser"
import {useWorkspace} from "../components/workspace/useWorkspace"
import {saveSchema, subscribeOnSchema, usageOf} from "./storage"


export const useStorage = () => {
    const { wid } = useWorkspace()
    const { tenantId } = useUser()
    
    const loadSchema = useCallback( (onLoad, onError) => subscribeOnSchema(tenantId, wid, onLoad, onError), [tenantId, wid])
    const saveSchemaCallback = useCallback( (schema) => saveSchema(tenantId, wid, schema), [tenantId, wid])
    const usageOfCallback = useCallback( (pointer) => usageOf(tenantId, wid, pointer), [tenantId, wid])

    return {
        loadSchema,
        saveSchema: saveSchemaCallback,
        usageOf: usageOfCallback
    }
}