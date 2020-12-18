const jwtParser = require('atlassian-jwt')
//const firebase = require("firebase/app");
//import "firebase/functions";
const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const jiraApi = require('./jira-api')

admin.initializeApp({ projectId: "my-things-60357" });

const firestore = admin.firestore()
const auth = admin.auth()
const logger = functions.logger

const { Addon, AuthError } = require('atlassian-connect-auth')
const { validateToken, extractToken, validateQsh } = require('atlassian-connect-auth/lib/util')

const addon = new Addon({
    baseUrl: process.env.NGROK_URL || functions.config().jira.app.baseurl,
    product: 'jira',
})




const handleInstall = async (req, res) => {

    try {
        
        logger.debug(`handleInstall req.path: ${req.path}, req.originalUrl: ${req.originalUrl}, body:`, req.body)
        if(process.env.NGROK_URL) {
            logger.debug(`Fix ngrok url rewrite, use req.path: ${req.path} instead of req.originalUrl: ${req.originalUrl}` )
            req.originalUrl = req.path
            // req.originalUrl = `https://c221e70fb59a.eu.ngrok.io`
        }
        const expectedHash = jwtParser.createQueryStringHash(
            req.originalUrl ? jwtParser.fromExpressRequest(req) : req,
            false,
            addon.baseUrl
          )
          logger.debug('Hash', expectedHash)

        const accountRef = firestore.doc(`meta/${req.body.clientKey}`)
        await addon.install(req, {

            loadCredentials: async clientKey => {
                const snapshot = await accountRef.get()
                if(snapshot.exists) {
                    const { account } = snapshot.data()
                    logger.debug(`Loading account ${clientKey}: `, account)
                    return account
                }
                return null
            },
            saveCredentials: async (clientKey, newCredentials, storedCredentials) => {
                if (storedCredentials) {
                    logger.log(`Update account:`, { clientKey, newCredentials, storedCredentials })
                } else {
                    logger.log(`Save new account: `, { clientKey, newCredentials, storedCredentials })
                }

                if(accountRef.exists) {
                    await accountRef.update({ account: newCredentials })
                    auditLogger('Install - Updated tenant account', 201, null, req, clientKey)
                } else {
                    await accountRef.set({ account: newCredentials })
                    auditLogger('Install - Installed a new tenant', 201, null, req, clientKey)
                }
                return 'Wii'
            }
        })

        
        return res.sendStatus(201)
    } catch (error) {
        if (error instanceof AuthError) {
            logger.warn('AuthError:', error)
            auditLogger('Install - Failed unauthorized', 401, error, req , req.body.clientKey)
            return res.sendStatus(401)
        } else {
            logger.error('Unknown error:', error)
            auditLogger('Install - Failed unknown error', 500, error, req , req.body.clientKey)
            return res.sendStatus(500)
        }
    }
}

const auditLogger = async ( message, statusCode, error, req, clientKey) => {
    const auditRef = firestore.collection(`meta/${clientKey}/audit`)
    const timestamp = new Date()
    const log = await auditRef.doc(`${timestamp.getTime()}`).set({
        message,
        statusCode,
        error: JSON.stringify(error),
        headers: req.headers,
        body: req.body,
        timestamp: timestamp
    })
    logger.debug(`Added audit log id ${log.id}: ${message}`)
}

const handleAuth = async (req, res, next) => {
    try {
        await addon.auth(req, {
            loadCredentials: clientKey => {

            }
        })

        return next()
    } catch (error) {
        if (error instanceof AuthError) {
            logger.warn(error)
            return res.sendStatus(401)
        } else {
            logger.error(error)
            return res.sendStatus(500)
        }
    }
}
const handleTokenExchange = async (req, res) => {
    console.log('Doing token exhange')
    logger.info('handleTokenExchange got jiraJwt: ', req.query.jwt)
    try {
        
        const jiraToken = extractToken(req)
        const jwt = jwtParser.decode(jiraToken, '', true) 
        logger.debug('parsed token to ', jwt)
        const clientKey = jwt.iss
        const accountId = jwt.sub

        const accountSnap = await firestore.doc(`meta/${clientKey}`).get()
        if(accountSnap.exists) {
            logger.debug('Found users account')
        } else {
            new Error('No account was found for ', clientKey)
        }
        const account = accountSnap.data().account
        const payload = validateToken(jiraToken, account.sharedSecret)
        //validateQsh(req, payload, addon.baseUrl)

        logger.debug('JWT is valid!')
        const groups = await jiraApi.getUserPermissionGroupes(accountId, account.baseUrl, functions.config().jira.app.key, account.sharedSecret)
        logger.debug('Got groups ', groups)
        const auth = admin.auth()
        var additionalClaims = {
            x_mt_tenant_id: clientKey,
            x_mt_account_id: accountId,
        };
        groups.forEach(group => {
            additionalClaims[`x_mt_groop-${group}`]="true"
        });
        logger.debug('Create a custom token with claims:', additionalClaims)
        const customToken = await auth.createCustomToken(accountId, additionalClaims)
        logger.debug('Created a custom token with claims:', customToken)
        return res.json({ 
            customToken: customToken,
        })
    } catch(error){
        if (error instanceof AuthError) {
            logger.warn(error)
            return res.sendStatus(401)
        } else {
            logger.error(error)
            return res.sendStatus(500)
        }
    }
    
}

const handleDescriptor = async (req, res) => {

    const descriptor = {
        key: functions.config().jira.app.key,
        name: functions.config().jira.app.name,
        baseUrl: addon.baseUrl,
        vendor: {
            name: functions.config().jira.app.vendor.name,
            url: functions.config().jira.app.vendor.url
        },
        links: {
            config: ''
        },
        authentication: {
            type: 'jwt'
        },
        scopes: [
            'read'
        ],
        enableLicensing: false,
        lifecycle: {
            installed: '/api/hooks/jira/installed'
        },
        modules: {
            generalPages: [
                {
                    key: 'editor',
                    name: {
                        value: functions.config().jira.app.page.title.general
                    },
                    url: '/editor',
                    conditions: [{
                        condition: 'user_is_logged_in'
                    }]
                }
            ]
        }
    }

    res.json(descriptor)
}

module.exports = {
    handleDescriptor,
    handleInstall,
    handleTokenExchange,
} 