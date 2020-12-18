
const functions = require('firebase-functions');
const connectApp = require('./atlassian/connect-app')
const express = require("express");


const app = express()
  .use('/api/atlassian-connect.json', connectApp.handleDescriptor)
  .post('/api/hooks/jira/installed', connectApp.handleInstall)
  ///.post('/api/hooks/jira/uninstalled', handleAuth, handleUninstall)

  .get('/api/auth/jira/login', connectApp.handleTokenExchange) 

exports.api = functions
    .https.onRequest(app)