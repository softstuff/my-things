import React from 'react';
import renderer from 'react-test-renderer';

import { processToCrumData } from '../ThingsBreadcrumbs'

describe('handle crum', ()=>{

    it('can split a level 1 path correct', ()=>{

        const result = processToCrumData('/', 'c1', 'd1')

        expect(result.length).toBe(1)
        expect(result[0].levelPath).toBe('/')
        expect(result[0].collectionId).toBe('c1')
        expect(result[0].documentId).toBe('d1')
    })

    it('can split a level 1 path with no docId correct ', ()=>{

        const result = processToCrumData('/', 'c1', undefined)

        expect(result.length).toBe(1)
        expect(result[0].levelPath).toBe('/')
        expect(result[0].collectionId).toBe('c1')
        expect(result[0].documentId).toBe(undefined)
    })

    it('can split a level 1 path with no colId or docId correct ', ()=>{

        const result = processToCrumData('/', undefined, undefined)

        expect(result.length).toBe(0)
    })

    it('can split a level 2 path correct', ()=>{

        const result = processToCrumData('/foo/bar/', 'c1', 'd1')

        expect(result.length).toBe(2)
        expect(result[0].levelPath).toBe('/')
        expect(result[0].collectionId).toBe('foo')
        expect(result[0].documentId).toBe('bar')
        expect(result[1].levelPath).toBe('/foo/bar/')
        expect(result[1].collectionId).toBe('c1')
        expect(result[1].documentId).toBe('d1')
    })

    it('can split a level 2 path with no docId correct', ()=>{

        const result = processToCrumData('/foo/bar/', 'c1', undefined)
        
        expect(result.length).toBe(2)
        expect(result[0].levelPath).toBe('/')
        expect(result[0].collectionId).toBe('foo')
        expect(result[0].documentId).toBe('bar')
        expect(result[1].levelPath).toBe('/foo/bar/')
        expect(result[1].collectionId).toBe('c1')
        expect(result[1].documentId).toBe(undefined)
    })

    it('can split a level 2 path with no docId or colId correct', ()=>{

        const result = processToCrumData('/foo/bar/', undefined, undefined)
        
        expect(result.length).toBe(1)
        expect(result[0].levelPath).toBe('/')
        expect(result[0].collectionId).toBe('foo')
        expect(result[0].documentId).toBe('bar')
    })


    it('can split a level 3 path correct', ()=>{

        const result = processToCrumData('/c1/d1/c2/d2/', 'c3', 'd3')

        expect(result.length).toBe(3)
        expect(result[0].levelPath).toBe('/')
        expect(result[0].collectionId).toBe('c1')
        expect(result[0].documentId).toBe('d1')
        expect(result[1].levelPath).toBe('/c1/d1/')
        expect(result[1].collectionId).toBe('c2')
        expect(result[1].documentId).toBe('d2')
        expect(result[2].levelPath).toBe('/c1/d1/c2/d2/')
        expect(result[2].collectionId).toBe('c3')
        expect(result[2].documentId).toBe('d3')
    })

    it('can split a level 3 path with no docId correct', ()=>{

        const result = processToCrumData('/c1/d1/c2/d2/', 'c3', undefined)

        expect(result.length).toBe(3)
        expect(result[0].levelPath).toBe('/')
        expect(result[0].collectionId).toBe('c1')
        expect(result[0].documentId).toBe('d1')
        expect(result[1].levelPath).toBe('/c1/d1/')
        expect(result[1].collectionId).toBe('c2')
        expect(result[1].documentId).toBe('d2')
        expect(result[2].levelPath).toBe('/c1/d1/c2/d2/')
        expect(result[2].collectionId).toBe('c3')
        expect(result[2].documentId).toBe(undefined)
    })

    it('can split a level 3 path with no docId or colId correct', ()=>{

        const result = processToCrumData('/c1/d1/c2/d2/', undefined, undefined)

        expect(result.length).toBe(2)
        expect(result[0].levelPath).toBe('/')
        expect(result[0].collectionId).toBe('c1')
        expect(result[0].documentId).toBe('d1')
        expect(result[1].levelPath).toBe('/c1/d1/')
        expect(result[1].collectionId).toBe('c2')
        expect(result[1].documentId).toBe('d2')
    })
})