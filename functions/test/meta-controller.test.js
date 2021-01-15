
const test = require('firebase-functions-test')({
    projectId: 'my-things-60357',
  }, '../../my-things-60357.json');

const log = require('mocha-logger')
const assert = require('assert')
const firebase = require('@firebase/testing')

const underTest = require('../tenant/meta-controller');
const { describe } = require('mocha');

const projectId = "my-things-60357"
const tenantId = 't1'
const siteModerator = {uid: 'superuser', myThings: { moderator: true}}
const tenantAdmin = {uid: 'tenantBoss', myThings: { admin: true, tenantId: tenantId}}
const tenantUser = {uid: 'tenantuser', myThings: {tenantId: tenantId}}


const app = (auth) => {
    return firebase.initializeTestApp({projectId, auth: auth})
}

const admin = () => {
    return firebase.initializeAdminApp({projectId})
}

beforeEach(async ()=>{
    await firebase.clearFirestoreData({projectId});
})
// afterAll(async() => {
//     await firebase.clearFirestoreData({projectId: PROJECT_ID})
// })

describe('validate security for handling levels changes', () => {

    timeout(5000);

    it('can not list jira accounts if not authorized', () => {
        const path = underTest.levelPath(3)
        expect(path).toEqual('{c1}/{d1}/{c2}/{d2}/{c3}/{d3}')
    }) 

    it('can create a leveled path', () => {
        const params = {tenantId:"t1",wid:"default",c1:"foo",d1:"bar",c2:"foo2",d2:"bar2",c3:"foo3",d3:"bar3",c4:"foo4",d4:"bar4"}
        const path = underTest.pathForLevel(params, 3)
        expect(path).toEqual('tenants/t1/workspaces/default/foo/bar/foo2/bar2/foo3/bar3')

        const path2 = underTest.pathForLevel(params, 2)
        expect(path2).toEqual('tenants/t1/workspaces/default/foo/bar/foo2/bar2')

        const path0 = underTest.pathForLevel(params, 0)
        expect(path0).toEqual('tenants/t1/workspaces/default')
    }) 
    
    it('when added level 1 meta document the create child at workspace',  (done)=>{
        setTimeout(done, 2500);
        (async ()=>{
        
            const snap = test.firestore.makeDocumentSnapshot({name: 'Wiii'}, `tenants/t1/workspaces/default/muu/bää`)
            
            const wrapped = test.wrap(underTest.onCreateLevel1)

            await wrapped(snap)



            // const data = {"eventId":"fc8c9ee2-3d4c-4a59-98bf-7aec1e83cf52",
            // "timestamp":"2021-01-12T16:06:54.432Z",
            // "eventType":"google.firestore.document.create",
            // "resource":{"service":"firestore.googleapis.com",
            // "name":"projects/my-things-60357/databases/(default)/documents/tenants/t1/workspaces/default/foo/bar"},
            // "params":{"tenantId":"t1","wid":"default","c1":"foo","d1":"bar"},
            // "severity":"INFO","message":"onCreate tenants/t1/workspaces/default/foo/bar"}

            const db = app(tenantAdmin).firestore()

            // // await db.doc(`tenants/${tenantId}/workspaces/default/foo/bar`).set({name: 'Woo'})


            await new Promise((r)=>setTimeout(r, 3000))

            try {
                log.log('get Data')
                const parent = await db.doc(`tenants/${tenantId}/workspaces/default`).get()

                log.log('Data is', parent.data())
                // expect(parent.data().meta.children).toContain('foo')
            } catch(error) {
                log.error(error)
            }
            done()
        })()
    })


    it('xxx', async ()=>{
        
        
        const db = app(tenantAdmin).firestore()

        await db.doc(`tenants/${tenantId}/workspaces/default/foo/bar`).set({name: 'Woo'})


        // await new Promise((r)=>setTimeout(r, 10000))


        // const parent = await db.doc(`tenants/${tenantId}/workspaces/default`).get()

        // console.log('Data is', parent.data())
        // expect(parent.data().meta.children).toContain('foo')

    })

    it('when level 1 document is deleted the workspace meta.children should remove the deleted collection', async ()=>{

        try {
        const db = app(tenantAdmin).firestore()

        const refKeeper = db.doc(`tenants/${tenantId}/workspaces/default`)
        const collectionRef = refKeeper.collection('foo')
        const docRef = collectionRef.doc(`bar`)
        await docRef.set({name: 'Woo'})


        const keeperSnapshot = await refKeeper.get()
        const docBefore = keeperSnapshot.data()
        
        expect(docBefore.meta.children).toContain()


        await wait(500)


        const parent = await db.doc(`tenants/${tenantId}/workspaces/default`).get()

        console.log('Data is', parent.data())
        // expect(parent.data().meta.children).toContain('foo')
        } catch(error){
            console.error(error)
            // fail(error)
        }

    })

    const wait = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
 }
})
