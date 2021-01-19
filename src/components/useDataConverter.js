import { useCallback } from 'react'

const useDataConverter = () => {

    const formToJsonSchema = useCallback( convertFormToJsonSchema, [])
    const schemaPropsToList = useCallback( convertSchemaPropsToList, [])
    const schemaPropsToMap = useCallback( convertSchemaPropsToMap, [])
    return {
        formToJsonSchema, 
        schemaPropsToList,
        schemaPropsToMap
    }

}

const convertFormToJsonSchema = (title, data) => {
    console.log('Converting formToJsonSchema ', data)
    let jsonSchemaData = {
        '$schema': "http://json-schema.org/draft-07/schema#",
        '$id': "http://example.com/product.schema.json",
        'title': title,
        'type': "object",
        'properties': data?.attribute ? data.attribute.reduce( (obj, item, index)=> {
            return { 
                ...obj,
                [item.key]: {
                        description: item.description,
                        type: item.type,
                        order: index
                    }
                }
        }, {}) : {},
        'required': data?.attribute ? data.attribute.filter(item=>item.required).map(item => item.key) : []
         
        
    }
    return jsonSchemaData
}

const convertSchemaPropsToList = (schema) => {
    if (!schema?.properties) {
        return []
    }
    let propArray = Object.getOwnPropertyNames(schema?.properties).map(key => {
        return {
            key: key, 
            type: schema.properties[key].type,
            description: schema.properties[key]?.description || '',
            required: schema.required?.includes(key) || false,
            order: schema.properties[key]?.order || 0
        }
    })
    propArray.sort((a,b) => a.order - b.order)
    return propArray
}
const convertSchemaPropsToMap = (schema) => {
    let propArray = convertSchemaPropsToList(schema)
    return propArray.reduce( (map, item) => {
        map[item.key] = item
        return map
    }, {})
}

export default useDataConverter
