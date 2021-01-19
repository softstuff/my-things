import Joi from "joi";


class SchemaHandler {
    
    validate(compiledSchema, data) {

        console.log('Validating', compiledSchema, data)

        const schema = Joi.compile(compiledSchema)

        const result = schema.validate(data)

        console.log('Validate result', result)
    }

}


export default SchemaHandler