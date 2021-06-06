// @flow
import {act, renderHook} from '@testing-library/react-hooks'
import useValidator from './useValidator'


describe('verify imput types', () => {
    const { result } = renderHook(() => useValidator())

    const schema = {
        type: "object",
        properties: {
            foo: { type: "number", order: 1 },
            bar: { type: "number", order: 2 },
        },
        required: ["foo"],
        additionalProperties: true,
    }


    it("validate number field with string input a integer", () => {

        const data = { foo: "1", bar: "muu" }

        act(() => {
            const validationResult = result.current.validateField('foo', data.foo, schema)

            expect(validationResult.valid).toBeTruthy()
            expect(validationResult.errors.length).toBe(0)
        })
    })

    it("validate number field with string input a number", () => {

        const data = { foo: "1.1", bar: "muu" }

        act(() => {
            const validationResult = result.current.validateField('foo', data.foo, schema)

            expect(validationResult.valid).toBeTruthy()
            expect(validationResult.errors.length).toBe(0)
        })
    })

    it("validate number field with string input a string", () => {

        const data = { foo: "1X", bar: "muu" }

        act(() => {
            const validationResult = result.current.validateField('foo', data.foo, schema)

            expect(validationResult.valid).toBeFalsy()
            expect(validationResult.errors.length).toBe(1)
            expect(validationResult.errors[0]).toBe('should be number')
        })
    })
})

describe('Handle required', () => {
    const { result } = renderHook(() => useValidator())

    const schema = {
        type: "object",
        properties: {
            foo: { type: "number", order: 1 }
        },
        required: ["foo"]
    }


    it("with value", () => {

        const data = { foo: 42 }

        act(() => {
            const validationResult = result.current.validateField('foo', data.foo, schema)

            expect(validationResult.valid).toBeTruthy
            expect(validationResult.errors.length).toBe(0)
        })
    })

    it("without value", () => {

        const data = {}

        act(() => {
            const validationResult = result.current.validateField('foo', data.foo, schema)

            expect(validationResult.valid).toBeFalsy()
            expect(validationResult.errors.length).toBe(1)
            expect(validationResult.errors[0]).toBe('foo is required')
        })
    })
})

describe('Handle not required', () => {
    const { result } = renderHook(() => useValidator())

    const schema = {
        type: "object",
        properties: {
            foo: { type: "number", order: 1 },
            bar: { type: "string", order: 1 }
        }
    }


    it("with value", () => {

        const data = { foo: 42 }

        act(() => {
            const validationResult = result.current.validateField('foo', data.foo, schema)
            expect(validationResult.valid).toBeTruthy()
            expect(validationResult.errors.length).toBe(0)
        })
    })

    it("without value, handle undefined value", () => {
        const data = {}
        act(() => {
            const validationResult = result.current.validateField('foo', data.foo, schema)

            console.log("Validate result ", JSON.stringify(validationResult))

            expect(validationResult.valid).toBeTruthy()
            expect(validationResult.errors.length).toBe(0)
        })
    })

    it("without value, handle empty string value", () => {
        const data = {bar: ''}
        act(() => {
            const validationResult = result.current.validateField('bar', data.bar, schema)

            console.log("Validate result ", JSON.stringify(validationResult))

            console.log(validationResult.errors)
            expect(validationResult.valid).toBeTruthy()
            expect(validationResult.errors.length).toBe(0)
        })
    })
})

xit("regex", () => {

    //         const patten1  = /\[(.*)\].(.*)/
    // const patten  = "\[(.*)\].(.*)"
    // const [, index, fieldName] = patten.exec('/foo')
    // console.log('Got', index, fieldName)

    let url = '/foo'
    console.log(/(.*)\.(.*)/.exec(url))

})
