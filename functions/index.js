const functions = require('firebase-functions');
const connectApp = require('./atlassian/connect-app')
const tenant = require('./tenant/tenant')
const metaController = require('./tenant/meta-controller')
const fs = require('./firebase-service');
const {getSchema} = require('./tenant/schema')
const express = require("express");
const cors = require('cors')

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
const app = express()
  .use(cors(corsOptions))
  .use('/api/atlassian-connect.json', connectApp.handleDescriptor)
  .post('/api/hooks/jira/installed', connectApp.handleInstall)
  ///.post('/api/hooks/jira/uninstalled', handleAuth, handleUninstall)

  .get('/api/auth/jira/login', connectApp.handleTokenExchange)
  .post('/api/tenant', fs.checkIfAuthenticated, tenant.createTenant)

  .get('/api/schema/:tenantId/:wid/*.json', getSchema)



exports.api = functions.https.onRequest(app)

exports.imports = require('./imports/importer')

// exports.onCreateLevel1 = metaController.onCreateLevel1
// exports.onUpdateLevel1 = metaController.onUpdateLevel1
// exports.onDeleteLevel1 = metaController.onDeleteLevel1

// exports.onCreateLevel2 = metaController.onCreateLevel2
// exports.onUpdateLevel2 = metaController.onUpdateLevel2
// exports.onDeleteLevel2 = metaController.onDeleteLevel2