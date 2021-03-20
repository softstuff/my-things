import { useWorkspace } from "../components/workspace/useWorkspace"

import { saveSchema} from "../firebase/storage"
import jp from 'json-pointer'
import { useUser } from "../components/user/useUser"
import { useCallback } from "react"

export const useSchema = () => {

    const {wid, schema} = useWorkspace()
    const { tenantId } = useUser()

    const translateToSubCollectionFor = pointer => pointer === '' ? `${pointer}/properties` : `${pointer}/items/properties`

    const defaultRoot = () => {
        console.log("Create default schema")
        return {
            $schema: "http://json-schema.org/draft-07/schema#",
            $id: `${window.location.protocol}//${window.location.host}/api/schema/${wid}.json`,
            title: `Workspace ${wid}`,
            type: 'object',
            properties: {}
        }
    }

    const addNewCollection = useCallback( (pointer, key, description) => {
        console.log("addNewCollection", pointer, key, description, schema)


        let schemaToSave = Object.assign({}, schema || defaultRoot())
        const subPointer = translateToSubCollectionFor(pointer)
        let properties =  jp.get(schemaToSave, subPointer)
        properties[key] = {
            description,
            type: "array",
            items: {
              type: "object",
              properties: {},
              required: [],
              additionalProperties: false
            }
        }

        jp.set(schemaToSave, subPointer, properties)

        console.log("- schemaToSave", schemaToSave)

        saveSchema(tenantId, wid, schemaToSave)
        return `${subPointer}/${key}`
    },[])

    const deleteCollection = useCallback( (pointer) => {
        console.log("deleteCollection", pointer)

        let schemaToSave = Object.assign({}, schema)
        jp.remove(schemaToSave, pointer)

        console.log("- schemaToSave", schemaToSave)

        saveSchema(tenantId, wid, schemaToSave)
    },[])

    const saveProperty = useCallback( (pointer, properties) => {
        console.log("init saveProperty", pointer, properties)
        let schemaToSave = Object.assign({}, schema)
        jp.set(schemaToSave, pointer, properties)
        
        console.log('saveProperty', schemaToSave)
        saveSchema(tenantId, wid, schemaToSave)
        return schemaToSave
    },[])

    const addProperty = useCallback( (parentPointer, key, required, data) => {
        console.log("init addProperty", parentPointer, key, 'required:',required, data)
        const propertyPointer = `${parentPointer}/items/properties/${key}`
        const requeredPointer = `${parentPointer}/items/required`
        let schemaToSave =JSON.parse(JSON.stringify(schema))
        const property = cleanEmptyValues(data)
        jp.set(schemaToSave, propertyPointer, property)

        let requiredKeys = jp.has(schemaToSave, requeredPointer) ? jp.get(schemaToSave, requeredPointer) : []
        if(!!(required)) {
            console.log("require is true ", required, "Add", key,"from ", requiredKeys)
            if (!requiredKeys.includes(key) ){
                requiredKeys.push(key)
            }
        } else {
            requiredKeys = requiredKeys.filter(item => item != key)
            console.log("Cleared ", key, " from ", requiredKeys)
        }
        jp.set(schemaToSave, requeredPointer, requiredKeys)
        
        console.log('saveProperty', schemaToSave)
        saveSchema(tenantId, wid, schemaToSave)
        return schemaToSave
    },[])

    const deleteProperty = useCallback( (parentPointer, key) => {
        console.log("init deleteProperty", parentPointer, key)
        const propertyPointer = `${parentPointer}/items/properties/${key}`
        const requeredPointer = `${parentPointer}/items/required`
        let schemaToSave =JSON.parse(JSON.stringify(schema))
        jp.remove(schemaToSave, propertyPointer)

        if (jp.has(schemaToSave, requeredPointer)) {
            let requiredKeys = jp.get(schemaToSave, requeredPointer)
            requiredKeys = requiredKeys.filter(item => item != key)
            jp.set(schemaToSave, requeredPointer, requiredKeys)
        }

        console.log('saveProperty', schemaToSave)
        saveSchema(tenantId, wid, schemaToSave)
        return schemaToSave
    },[])

    const cleanEmptyValues = useCallback( obj => {
        for (var propName in obj) {
          if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
            delete obj[propName];
          }
        }
        return obj
      },[])

    const save = useCallback( schema => {
        saveSchema(tenantId, wid, schema)
    },[])

    const getPropertyFor = useCallback( pointer => {
        return  jp.get(schema, pointer)
    },[])

    const collectionIdFor = useCallback( pointer =>  {
        return pointer.substring(pointer.lastIndexOf('/')+1)
    },[])

    const collectionIdPath = useCallback( pointer =>  {
        const regex = /(\/items\/properties|\/properties)/ig
        let path = pointer.replace(regex, '')
        path = path.replace(/^\//, '');
        return path.split('/')
    },[])

    const getPointerFor = useCallback( collectionPath => {
        let result = '/properties/' + collectionPath.slice(1).replace(/\//ig, '/items/properties/')
        return result
    },[])
    
    return {
        schema,
        addNewCollection,
        deleteCollection,
        save,
        saveProperty,
        addProperty,
        deleteProperty,
        getPropertyFor,
        collectionIdFor,
        collectionIdPath,
        getPointerFor
    }


}


