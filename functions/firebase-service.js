const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');

admin.initializeApp();
// admin.initializeApp({ projectId: "my-things-60357" });

const firestore = admin.firestore()
const auth = admin.auth()
const storage = admin.storage()
const database = admin.database()
const logger = functions.logger

//logger.debug(functions.config())
// logger.debug(process.env)

const getAuthToken = (req, res, next) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      req.authToken = req.headers.authorization.split(' ')[1];
    } else {
      req.authToken = null;
    }
    next();
  };
  
  
const checkIfAuthenticated = (req, res, next) => {
    console.log('checkIfAuthenticated')
   getAuthToken(req, res, async () => {
    
    const { authToken } = req;
      try {        
        const userInfo = await auth.verifyIdToken(authToken);
        logger.debug("it is valid")
          
        logger.debug('Set req.authClaims to ', userInfo)
        req.authClaims = userInfo
        req.authId = userInfo.uid;
        return next();
      } catch (e) {
        logger.error('Token is not ok', authToken, e)
        return res
          .status(401)
          .send({ error: 'You are not authorized to make this request' });
      }
    });
  };

module.exports = {
    functions,
    admin,
    firestore,
    auth,
    storage,
    database,
    logger,
    checkIfAuthenticated
}