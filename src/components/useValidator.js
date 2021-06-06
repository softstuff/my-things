import {useCallback} from 'react'
import Ajv from "ajv"

export default function useValidator() {

    const validate = useCallback( doValidation, [])
    const validateField = useCallback( doValidationOnField, [])

    return {
        validate,
        validateField
    }

}

const doValidation = (data, schema) => {
    console.log('Converting formToJsonSchema ', data)
    
    const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
    const validate = ajv.compile(schema)
    const valid = validate(data)
    if (!valid) console.log(validate.errors)

    return {
        valid,
        errors: validate.errors
    }
}


const doValidationOnField = (fieldKey, fieldData, schema) => {
    let fieldSchema = schema.properties[fieldKey]

    console.log('begin doValidationOnField on ', fieldKey, JSON.stringify(fieldData), typeof fieldData, fieldSchema)

    if (!isNaN(fieldData)){
        fieldData = +fieldData
    }

    const ajv = new Ajv()
    ajv.addKeyword("order")
    const validate = ajv.compile(fieldSchema)

    // eslint-disable-next-line
    if(fieldData === undefined || fieldData == "") {
        const required = schema.required?.includes(fieldKey)
        return {
            valid: !required,
            errors: !required ? [] : [`${fieldKey} is required`]
        }    
    } 
    const valid = validate(fieldData)
    const errors = validate.errors?.map(error=>error.message) || []

    console.log("doValidationOnField", fieldKey, fieldData, valid, errors)
    return {
        valid,
        errors 
    }
}
