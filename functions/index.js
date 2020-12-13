const functions = require('firebase-functions');
const connectApp = require('./connect-app')
const express = require("express");


const app = express()
  .use('/api', express.static('public'))
  .post('/api/hooks/jira/installed', connectApp.handleInstall)
  ///.post('/api/hooks/jira/uninstalled', handleAuth, handleUninstall)

  .get('/api/auth/jira/login', connectApp.handleTokenExchange) 

exports.api = functions
    .https.onRequest(app)