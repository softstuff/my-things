import { useCallback } from 'react'

const useDataConverter = () => {

    const formToJsonSchema = useCallback( convertFormToJsonSchema, [])
    const schemaPropsToList = useCallback( convertSchemaPropsToList, [])
    const schemaPropsToMap = useCallback( convertSchemaPropsToMap, [])
    const explainTypeToText = useCallback( convertTypeToHumanReadableText, [])
    return {
        formToJsonSchema, 
        schemaPropsToList,
        schemaPropsToMap,
        explainTypeToText
    }

}

const convertFormToJsonSchema = (data) => {
    console.log('Converting formToJsonSchema ', data)
    let jsonSchemaData = {
        'type': "object",
        'properties': data?.attribute ? data.attribute.reduce( (obj, item, index)=> {
            let prop = { 
                ...obj,
                [item.key]: {
                        description: item.description,
                        type: item.type,
                        order: index
                    }
                }
            if (item.minLength) prop[item.key].minLength = parseInt(item.minLength)
            if (item.maxLength) prop[item.key].maxLength = parseInt(item.maxLength)
            if (item.pattern) prop[item.key].pattern = item.pattern
            if (item.minimum) prop[item.key].minimum = parseInt(item.minimum)
            if (item.maximum) prop[item.key].maximum = parseInt(item.maximum)
            // if (item.type === 'array') {
            //     prop[item.key].items = { 
            //         $ref: `/${collectionId}/${item.key}.json`
            //     }
            //     prop[item.key].default = []
            // }
            return prop
        }, {}) : {},
        'required': data?.attribute ? data.attribute.filter(item=>item.required).map(item => item.key) : []
         
        
    }
    return jsonSchemaData
}


const convertSchemaPropsToList = (schema) => {
    console.log('convertSchemaPropsToList:', schema)

    let propArray = Object.getOwnPropertyNames(schema?.properties  || schema?.items?.properties || {}).map(key => {
        let schemaProps = schema.type === 'object' ? schema.properties : schema.items.properties
        let schemaRequired = schema.type === 'object' ? schema.required : schema.items.required
        let prop = {
            key: key, 
            type: schemaProps[key].type,
            description: schemaProps[key]?.description || '',
            required: schemaRequired?.includes(key) || false,
            order: schemaProps[key]?.order || 0
        }
        if (schemaProps[key].minLength) prop.minLength = schemaProps[key].minLength
        if (schemaProps[key].maxLength) prop.maxLength = schemaProps[key].maxLength
        if (schemaProps[key].pattern) prop.pattern = schemaProps[key].pattern
        if (schemaProps[key].minimum) prop.minimum = schemaProps[key].minimum
        if (schemaProps[key].maximum) prop.maximum = schemaProps[key].maximum
        if (schemaProps[key].items) prop.items = schemaProps[key].items

        return prop
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

const convertTypeToHumanReadableText = prop => {
    let response = ''
    if (prop.type === 'string'){
        response += 'is a text'
        if (prop.minLength > 0) 
            response += `, min length of ${prop.minLength}`
        if (prop.maxLength > 0) 
            response += `, max length of ${prop.maxLength}`
        if (prop.pattern) 
            response += `, pattern of '${prop.pattern}'`
    } else if(prop.type === 'number') {
        response += 'is a decimal number'
        if (prop.minimum > 0) 
            response += `, minimum ${prop.minimum}`
        if (prop.maximum > 0) 
            response += `, maximum ${prop.maximum}`
    } else if(prop.type === 'integer') {
        response += 'is a integer number'
        if (prop.minimum > 0) 
            response += `, minimum ${prop.minimum}`
        if (prop.maximum > 0) 
            response += `, maximum ${prop.maximum}`
    
    } else if(prop.type === 'array') {
        response += 'is sub collection '
    }
    return response
}

export default useDataConverter
