const assert = require('assert')
const firebase = require('@firebase/testing')

const PROJECT_ID = "my-things-60357"
const tenantId = 't1'
const siteModerator = {uid: 'superuser', myThings: { moderator: true}}
const tenantAdmin = {uid: 'tenantBoss', myThings: { admin: true, tenantId: tenantId}}
const tenantUser = {uid: 'tenantuser', myThings: {tenantId: tenantId}}

const app = (auth) => {
    return firebase.initializeTestApp({projectId: PROJECT_ID, auth: auth})
}

const admin = () => {
    return firebase.initializeAdminApp({projectId: PROJECT_ID})
}


describe('validate security rules on jira collection', () => {

    beforeEach(async() => {
        await firebase.clearFirestoreData({projectId: PROJECT_ID})
        await admin().firestore().doc(`jira/${tenantId}`).set({name: 'Wii'})
    })
 
    it('can not list jira accounts if not authorized', async () => {
        const jira = app().firestore().doc(`jira/${tenantId}`)
        await firebase.assertFails(jira.get())
    }) 

    it('can list jira accounts if authorized as moderator', async () => {
        const jira = app(siteModerator).firestore().collection(`jira`)
        await firebase.assertSucceeds(jira.get())
    }) 

    it('can read jira accounts if authorized as moderator', async () => {
        const jira = app(siteModerator).firestore().doc(`jira/${tenantId}`)
        await firebase.assertSucceeds(jira.get())
    }) 
})

describe('validate security rules for tenant level', () => {

    beforeEach(async() => {
        await firebase.clearFirestoreData({projectId: PROJECT_ID})
        await admin().firestore().doc(`tenants/${tenantId}`).set({name: 'Wii'})
    })

    it('can not read tenant data if not authorized', async () => {
        const tenants = app().firestore().doc(`tenants/${tenantId}`)
        await firebase.assertFails(tenants.get())
    })

    it('can read tenant data if authorized as a tenant user', async () => {
        const tenants = app(tenantUser).firestore().doc(`tenants/${tenantId}`)
        await firebase.assertSucceeds(tenants.get())
    }) 
    
    it('can not write tenant data if authorized as a tenant user', async () => {
        const tenants = app(tenantUser).firestore().doc(`tenants/${tenantId}`)
        await firebase.assertFails(tenants.set({data: 'fresh'}))
    }) 

    it('can write tenant data if authorized as a tenant admin user', async () => {
        const tenants = app(tenantAdmin).firestore().doc(`tenants/${tenantId}`)
        await firebase.assertSucceeds(tenants.set({data: 'fresh'}))
    }) 

    it('can write tenant data if authorized as a site moderator user', async () => {
        const tenants = app(siteModerator).firestore().doc(`tenants/${tenantId}`)
        await firebase.assertSucceeds(tenants.set({data: 'fresh'}))
    }) 

})

after(async() => {
    await firebase.clearFirestoreData({projectId: PROJECT_ID})
})
