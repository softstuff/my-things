import SchemaHandler from "./SchemaHandler"
import Joi from "joi";

describe('Handle validation', () => {
    
    it('Wii', () => {

        const schema1 = Joi.any().valid('foo', 'bar');
    console.log(schema1.describe());

        const schema = Joi.object({
                name: Joi.string().alphanum()
                .min(3)
                .max(30).required(),
                age: Joi.number().required().max(100).min(10)
        })

        schema.keys.name
        try {
            const raw = schema.describe()
            
            console.log('Raw', raw, JSON.stringify(raw))
        console.log("assert:", Joi.attempt({'x': 'kurre', name: 'nu'}, schema))

        // const underTest = new SchemaHandler()
        // underTest.validate([{'name', 'age'}], {name: 'foo', age: 42})

        } catch(error) {
            console.log("Errpr:", error)
        }
    })
})

// https://rossbulat.medium.com/joi-for-node-exploring-javascript-object-schema-validation-50dd4b8e1b0f