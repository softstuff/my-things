// var rewire = require('rewire');

// var wizard = rewire('ImportWizard.js');


describe('Application module', function() {

    // it('should output the correct error', function(done) {
    //     wizard.
    //     done();
    // });

    it('render collections', () => {
        const schema = JSON.parse(`{
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "Workspace default",
            "type": "object",
            "properties": {
              "Skola": {
                "description": "",
                "type": "array",
                "items": {
                  "type": "object",
                  "required": [],
                  "additionalProperties": false,
                  "properties": {
                    "Klass": {
                      "description": "",
                      "type": "array",
                      "items": {
                        "type": "object",
                        "required": [],
                        "additionalProperties": false,
                        "properties": {}
                      }
                    }
                  }
                }
              }
            },
            "$id": "http://localhost:3000/api/schema/default.json"
        }`)



        const renderSchemaRoot = (schema) => {
              Reflect.ownKeys(schema.properties).map(collection => {
                renderSchema(schema.properties, collection)
              })
            }

          const renderSchema = (level, collection) => {
            console.log("collection", collection)

            if (level[collection]?.items?.properties) {
              Reflect.ownKeys(level[collection]?.items.properties).map(child => {                
                  console.log("found a child ",child)
                  renderSchema(level[collection]?.items?.properties[child].items, child)
                })
            }
          }
        
          const renderedSchema = renderSchemaRoot(schema)
        
    })
  });