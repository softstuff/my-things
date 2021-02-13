// @flow
import {renderHook, act} from '@testing-library/react-hooks'
import useDataConverter from './useDataConverter'

describe('serialize form data to json schema', ()=>{
    const title = 'test title'
    const host = "http://localhost:1234"
    it('handle empty form', ()=>{

        const {result} = renderHook(() => useDataConverter())
        
        act(() => {
            const form = {}
            const json = result.current.formToJsonSchema(form)
            console.log('Converted', form, 'to', json)

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
            const json = result.current.formToJsonSchema(form)
            console.log('Converted', form, 'to', json)

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
                type: 'object',
                properties: {
                    Name: { description: 'Testing args', type: 'string' },
                    Age: { description: 'Testing args2', type: 'integer' },
                    Balance: { description: 'Testing args3', type: 'number' },
                    Kiddo: {
                        type: "array",
                        description: 'Testing args4',
                        items: {
                            type: 'object',
                            properties: {
                                ChildName: { description: 'Testing child args', type: 'string' },
                            }
                        }
                    }
                },
                required: [ 'Name', 'Balance' ]
            }

            const {result} = renderHook(() => useDataConverter())
    
            act(() => {  
                const fields = result.current.schemaPropsToList(schema)
                console.log('Converted', schema, 'to', fields)

                expect(fields.length).toBe(4)
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
                expect(fields[3].key).toBe('Kiddo')
                expect(fields[3].type).toBe(schema.properties.Kiddo.type)
                expect(fields[3].description).toBe(schema.properties.Kiddo.description)
                expect(fields[3].required).toBe(false)
            })            
        })

        describe('convert json schema to form fields', ()=>{
            it('handle a subcollections attributes', ()=>{
                const schema = {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            Name: { description: 'Testing args', type: 'string' },
                            Age: { description: 'Testing args2', type: 'integer' },
                            Balance: { description: 'Testing args3', type: 'number' },
                            Kiddo: {
                                type: "array",
                                description: 'Testing args4',
                                items: {
                                    "type": "object",
                                    "required": [],
                                    "additionalProperties": false,
                                    "properties": {}
                                  }
                            }
                        },
                        required: [ 'Name', 'Balance' ]
                    }
                }
    
                const {result} = renderHook(() => useDataConverter())
        
                act(() => {  
                    const fields = result.current.schemaPropsToList(schema)
                    console.log('Converted', schema, 'to', fields)
    
                    expect(fields.length).toBe(4)
                    expect(fields[0].key).toBe('Name')
                    expect(fields[0].type).toBe(schema.items.properties.Name.type)
                    expect(fields[0].description).toBe(schema.items.properties.Name.description)
                    expect(fields[0].required).toBe(true)
                    expect(fields[1].key).toBe('Age')
                    expect(fields[1].type).toBe(schema.items.properties.Age.type)
                    expect(fields[1].description).toBe(schema.items.properties.Age.description)
                    expect(fields[1].required).toBe(false)
                    expect(fields[2].key).toBe('Balance')
                    expect(fields[2].type).toBe(schema.items.properties.Balance.type)
                    expect(fields[2].description).toBe(schema.items.properties.Balance.description)
                    expect(fields[2].required).toBe(true)
                    expect(fields[3].key).toBe('Kiddo')
                    expect(fields[3].type).toBe(schema.items.properties.Kiddo.type)
                    expect(fields[3].description).toBe(schema.items.properties.Kiddo.description)
                    expect(fields[3].required).toBe(false)
                    expect(fields[3].items.type).toBe('object')
                    expect(fields[3].items.properties).toMatchObject({})
                    expect(fields[3].items.required).toMatchObject([])
                })            
            })
        })

        it('can handle missing required array', ()=>{
            const schema = {
                type: 'object',
                properties: {
                    Name: { description: 'Testing args', type: 'string' }
                }
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
    })
})
