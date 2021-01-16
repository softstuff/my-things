const jwtParser = require('atlassian-jwt')
const jiraApi = require('./jira-api')
const atlassianConn = require('atlassian-connect-auth')
const atlConUtil = require('atlassian-connect-auth/lib/util')
const { firestore, functions, auth, logger } = require('../firebase-service')

const addon = new atlassianConn.Addon({
    baseUrl: process.env.NGROK_URL || functions.config().jira.app.baseurl,
    product: 'jira',
})




const handleInstall = async (req, res) => {

    try {

        logger.debug(`handleInstall req.path: ${req.path}, req.originalUrl: ${req.originalUrl}, body:`, req.body)
        if (process.env.NGROK_URL) {
            logger.debug(`Fix ngrok url rewrite, use req.path: ${req.path} instead of req.originalUrl: ${req.originalUrl}`)
            req.originalUrl = req.path
        }
        const expectedHash = jwtParser.createQueryStringHash(
            req.originalUrl ? jwtParser.fromExpressRequest(req) : req,
            false,
            addon.baseUrl
        )
        logger.debug('Hash', expectedHash)

        const accountRef = firestore.doc(`jira/${req.body.clientKey}`)
        await addon.install(req, {

            loadCredentials: async clientKey => {
                const snapshot = await accountRef.get()
                if (snapshot.exists) {
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

                if (accountRef.exists) {
                    await accountRef.update({ account: newCredentials })
                    auditLogger('Install - Updated tenant account', 201, null, req, clientKey)
                } else {
                    const tenantRef = await firestore.collection('tenants').add({
                        meta: {
                            jira: true,
                            clientKey: clientKey
                        }
                    })
                    await accountRef.set({ 
                        account: newCredentials,
                        tenantId: tenantRef.id,
                        clientKey
                     })
                    auditLogger('Install - Installed a new tenant', 201, null, req, clientKey)
                }
                return 'Wii'
            }
        })


        return res.sendStatus(201)
    } catch (error) {
        if (error instanceof AuthError) {
            logger.warn('AuthError:', error)
            auditLogger('Install - Failed unauthorized', 401, error, req, req.body.clientKey)
            return res.sendStatus(401)
        } else {
            logger.error('Unknown error:', error)
            auditLogger('Install - Failed unknown error', 500, error, req, req.body.clientKey)
            return res.sendStatus(500)
        }
    }
}

const auditLogger = async (message, statusCode, error, req, clientKey) => {
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

        const jiraToken = atlConUtil.extractToken(req)
        const jwt = jwtParser.decode(jiraToken, '', true)
        const clientKey = jwt.iss
        const accountId = jwt.sub

        const accountSnap = await firestore.doc(`jira/${clientKey}`).get()
        if (!accountSnap.exists) {
            res.statusMessage= "wiii"
            res.status(404)
            res.send(`No account was found for clientKey: ${clientKey}, reinstall the app!`)
            
            return
        }

        const jira = accountSnap.data()
        const account = jira.account
        atlConUtil.validateToken(jiraToken, account.sharedSecret)

        logger.debug('JWT is valid!')
        const groups = await jiraApi.getUserPermissionGroupes(accountId, account.baseUrl, functions.config().jira.app.key, account.sharedSecret)
        logger.debug('Got groups ', groups)


        var additionalClaims = {
            myThings: {
                tenantId: jira.tenantId,
                admin: isAdmin(groups)
            },
            jira: {
                client_key: account.clientKey,
                base_url: account.baseUrl,
                account_id: accountId,
            }
        };

        logger.debug('Create a custom token with claims:', additionalClaims)
        const customToken = await auth.createCustomToken(accountId, additionalClaims)
        return res.json({
            customToken: customToken,
        })
    } catch (error) {
        if (error instanceof atlassianConn.AuthError) {
            logger.warn(error)
            return res.sendStatus(401)
        } else {
            logger.error(error)
            return res.sendStatus(500)
        }
    }

}

const isAdmin = (groups) => {
    const jiraAdminGroups = ['administrators','jira-administrators','jira-servicemanagement-users','site-admins']
    return groups && groups.some(group => jiraAdminGroups.includes(group))
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