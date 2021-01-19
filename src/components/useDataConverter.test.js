// @flow
import {renderHook, act} from '@testing-library/react-hooks'
import useDataConverter from './useDataConverter'

describe('serialize form data to json schema', ()=>{
    const title = 'test title'
    it('handle empty form', ()=>{

        const {result} = renderHook(() => useDataConverter())
        
        act(() => {
            const form = {}
            const json = result.current.formToJsonSchema(title, form)
            console.log('Converted', form, 'to', json)

            expect(json.title).toBe(title)
            expect(json.type).toBe('object')
            expect(json.properties).toStrictEqual({})
        })
    })

    it('handle attributes', ()=>{

        const {result} = renderHook(() => useDataConverter())
        
        act(() => {
            const form = {
                attribute: [
                    {key: 'Name', type: 'string', description: 'Testing args', required: true},
                    {key: 'Age', type: 'integer', description: 'Testing args2', required: false},
                    {key: 'Balance', type: 'number', description: 'Testing args3', required: true}
                ]
            }
            const json = result.current.formToJsonSchema(title, form)
            console.log('Converted', form, 'to', json)

            expect(json.title).toBe(title)
            expect(json.type).toBe('object')
            expect(json.properties.Name.description).toStrictEqual(form.attribute[0].description)
            expect(json.properties.Name.type).toStrictEqual(form.attribute[0].type)
            expect(json.properties.Age.description).toStrictEqual(form.attribute[1].description)
            expect(json.properties.Age.type).toStrictEqual(form.attribute[1].type)
            expect(json.properties.Balance.description).toStrictEqual(form.attribute[2].description)
            expect(json.properties.Balance.type).toStrictEqual(form.attribute[2].type)

            expect(json.required).toContain(form.attribute[0].key)
            expect(json.required).not.toContain(form.attribute[1].key)
            expect(json.required).toContain(form.attribute[2].key)
        })
    })

    describe('convert json schema to form fields', ()=>{
        it('handle all attributes', ()=>{
            const schema = {
                '$schema': 'http://json-schema.org/draft-07/schema#',
                '$id': 'http://example.com/product.schema.json',
                title: 'test title',
                type: 'object',
                properties: {
                    Name: { description: 'Testing args', type: 'string' },
                    Age: { description: 'Testing args2', type: 'integer' },
                    Balance: { description: 'Testing args3', type: 'number' }
                },
                required: [ 'Name', 'Balance' ]
            }

            const {result} = renderHook(() => useDataConverter())
    
            act(() => {  
                const fields = result.current.schemaPropsToList(schema)
                console.log('Converted', schema, 'to', fields)

                expect(fields.length).toBe(3)
                expect(fields[0].key).toBe('Name')
                expect(fields[0].type).toBe(schema.properties.Name.type)
                expect(fields[0].description).toBe(schema.properties.Name.description)
                expect(fields[0].required).toBe(true)
                expect(fields[1].key).toBe('Age')
                expect(fields[1].type).toBe(schema.properties.Age.type)
                expect(fields[1].description).toBe(schema.properties.Age.description)
                expect(fields[1].required).toBe(false)
                expect(fields[2].key).toBe('Balance')
                expect(fields[2].type).toBe(schema.properties.Balance.type)
                expect(fields[2].description).toBe(schema.properties.Balance.description)
                expect(fields[2].required).toBe(true)
            })            
        })

        it('can handle missing required array', ()=>{
            const schema = {
                '$schema': 'http://json-schema.org/draft-07/schema#',
                '$id': 'http://example.com/product.schema.json',
                title: 'test title',
                type: 'object',
                properties: {
                    Name: { description: 'Testing args', type: 'string' }
                },
                required: []
            }

            const {result} = renderHook(() => useDataConverter())
    
            act(() => {  
                const fields = result.current.schemaPropsToList(schema)
                console.log('Converted', schema, 'to', fields)
                expect(fields[0].required).toBe(false)
            })            
        })

        it('can handle missing description', ()=>{
            const schema = {
                '$schema': 'http://json-schema.org/draft-07/schema#',
                '$id': 'http://example.com/product.schema.json',
                title: 'test title',
                type: 'object',
                properties: {
                    Name: { type: 'string' }
                }
            }

            const {result} = renderHook(() => useDataConverter())
    
            act(() => {  
                const fields = result.current.schemaPropsToList(schema)
                console.log('Converted', schema, 'to', fields)
                expect(fields[0].description).toBe('')
            })            
        })

        it('brum', ()=>{
            
            for(let i=0; i<1000; i++) {
                const obj = {
                    h: {name: 'H'},
                    a: {name: 'A'},
                    c: {name: 'C'},
                    b: {name: 'B'},
                    e: {name: 'E'},
                    d: {name: 'D'},
                    g: {name: 'G'},
                    f: {name: 'F'},
                }
                const str = Object.getOwnPropertyNames(obj).join()
                expect(str).toBe('h,a,c,b,e,d,g,f')
            }
        })
    })
})
