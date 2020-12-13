const jwtParser = require('atlassian-jwt')

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore()

const functions = require('firebase-functions');
const logger = functions.logger
const { Addon, AuthError } = require('atlassian-connect-auth')
const { validateToken, extractToken, validateQsh } = require('atlassian-connect-auth/lib/util')


const addon = new Addon({
    baseUrl: 'https://my-things-60357.web.app',
    product: 'jira',
})

const handleInstall = async (req, res) => {

    try {
        
        logger.debug(`handleInstall body:`, req.body)
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
    logger.debug('handleTokenExchange got jiraJwt: ', req.query.jwt)
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
        const secret = accountSnap.data().account.sharedSecret
        const payload = validateToken(jiraToken, secret)
        //validateQsh(req, payload, addon.baseUrl)

        logger.debug('JWT is valid!')
        //TODO request user groups
        const auth = admin.auth()
        const additionalClaims = {
            tenantId: clientKey,
            accountId: accountId
        };
        const customToken = await auth.createCustomToken(accountId, additionalClaims)
        logger.debug('created a custom token with claims', additionalClaims, customToken)
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

module.exports = {
    handleInstall,
    handleTokenExchange
} 