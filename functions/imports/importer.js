const functions = require('firebase-functions');

exports.imports = functions.storage.bucket("imports").object().onFinalize( async (object, context) => {

    console.log("ss ", context)
    // console.log("Uploaded ", object.metadata, object.owner, object.acl, object.contentEncoding, object.contentType, object.contentDisposition, object.contentLanguage)

})