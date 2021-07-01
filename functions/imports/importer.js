const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const { storage } = require('../../src/firebase/config');
const csv = require('csv-parser');
const fs = require('fs');


exports.imports = functions.storage.bucket().object().onFinalize( async (object, context) => {


    console.log("ss ", context)
    console.log("Uploaded ", object.bucket, object.name, object.id)

    try{
        const file = admin.storage().bucket(object.bucket).file(object.name)
        console.log("File", file.name)
        // fs.createReadStream(file)
        const parsePromise = new Promise((resolve, reject) => {
            file.createReadStream()
            .pipe(csv())
            .on('data', (row) => {
                console.log(`row:`, row);
            })
            .on('end', function () {
                console.log("Done")
                resolve(file)
            })        
            .on("error", err => reject(err))     
        })
        
        return parsePromise
            .then(file => {
                console.log("Deleted")
                // file.delete()
            })
            .then(()=> console.log("Exit"))
            .catch( error => console.log("Error", error))

        // await file.delete()
        // console.log("Deleted")
        console.log("Exit")
    } catch(e){
        console.log("Error", e)
    }
})