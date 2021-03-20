// @flow
jest.mock('../firebase/storage')

import { act, renderHook } from '@testing-library/react-hooks'
import { WorkspaceContext } from '../components/workspace/WorkspaceProvider'
import { UserContext } from '../firebase/UserProvider'
import { saveSchema } from '../firebase/storage'
import { useSchema } from './useSchema'



const tenantId =  't1'
const claims = { myThings: {tenantId} }
const wid = 'w1' 
const workspace = {
    schema: {
        type: 'object', 
        properties: {
            foo: { type: 'string' }
        }
    }
}
const makeWrapper = () => ({ children }) => (
    <UserContext.Provider value={{claims}} >
        <WorkspaceContext.Provider value={{wid, workspace}} >
            {children}
        </WorkspaceContext.Provider>
    </UserContext.Provider>
)

describe('verify saveProperty', () =>{
    it("validate level 0", () => {

        const expected = {
            schema: {
                type: 'object', 
                properties: {
                    foo: { type: 'string' },
                    bar: { type: 'string' }
                }
            }
        }
        saveSchema.mockResolvedValue(expected.schema)
        
        const { result } = renderHook(() => useSchema(), { wrapper: makeWrapper() })

        const pointer = '/properties/bar'
        const properties = { type: 'string' }

        act(() => {
            const actual = result.current.saveProperty(pointer, properties)
            expect(actual).toStrictEqual(expected.schema)
            expect(saveSchema).toHaveBeenCalledWith(tenantId, wid, expected.schema);
        })
    })

})

describe('verify collectionIdFor', () =>{
    it("validate level 0", () => {
        const { result } = renderHook(() => useSchema(), { wrapper: makeWrapper() })

        const pointer = '/'
        act(() => {
            const path = result.current.collectionIdFor(pointer)
            expect(path).toBe('')
        })
    })

    it("validate level 1", () => {
        const { result } = renderHook(() => useSchema(), { wrapper: makeWrapper() })

        const pointer = '/properties/school'
        act(() => {
            const path = result.current.collectionIdFor(pointer)
            expect(path).toBe('school')
        })
    })

    it("validate level 2", () => {
        const { result } = renderHook(() => useSchema(), { wrapper: makeWrapper() })

        const pointer = '/properties/school/items/properties/class'
        act(() => {
            const path = result.current.collectionIdFor(pointer)
            expect(path).toBe('class')
        })
    })
})

describe('verify collectionIdPath', () => {

  
    it("validate level 0", () => {
        const { result } = renderHook(() => useSchema(), { wrapper: makeWrapper() })

        const pointer = '/'
        act(() => {
            const path = result.current.collectionIdPath(pointer)
            expect(path.length).toBe(1)
            expect(path[0]).toBe('')
        })
    })

    it("validate level 1", () => {
        const { result } = renderHook(() => useSchema(), { wrapper: makeWrapper() })

        const pointer = '/properties/school'
        act(() => {
            const path = result.current.collectionIdPath(pointer)
            console.log('path:', path)
            expect(path.length).toBe(1)
            expect(path[0]).toBe('school')
        })
    })

    it("validate level 2", () => {
        const { result } = renderHook(() => useSchema(), { wrapper: makeWrapper() })

        const pointer = '/properties/school/items/properties/class'
        act(() => {
            const path = result.current.collectionIdPath(pointer)
            console.log('path:', path)
            expect(path.length).toBe(2)
            expect(path[0]).toBe('school')
            expect(path[1]).toBe('class')
        })
    })
})

describe('validate collectionPath to pointer', () => {
    it('validate level 0', ()=>{
        const { result } = renderHook(() => useSchema(), { wrapper: makeWrapper() })

        const collectionPath = '/foo'
        act(() => {
            const pointer = result.current.getPointerFor(collectionPath)
            expect(pointer).toBe("/properties/foo")
        })
    })

    it('validate level 1', ()=>{
        const { result } = renderHook(() => useSchema(), { wrapper: makeWrapper() })

        const collectionPath = '/foo/bar'
        act(() => {
            const pointer = result.current.getPointerFor(collectionPath)
            expect(pointer).toBe("/properties/foo/items/properties/bar")
        })
    })

    
    it('validate level 3', ()=>{
        const { result } = renderHook(() => useSchema(), { wrapper: makeWrapper() })

        const collectionPath = '/foo/bar/wii'
        act(() => {
            const pointer = result.current.getPointerFor(collectionPath)
            expect(pointer).toBe("/properties/foo/items/properties/bar/items/properties/wii")
        })
    })

})