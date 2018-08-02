"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLUController_1 = require("./NLUController");
const request = require('request');
const config = require('../data/config.json');
class SpacyEntityParserV1 extends NLUController_1.default {
    

    call(query) {
        // call(query:string, latitude:string, longitude:string, sessionId:string, iana_timezone:string, contexts: string[]): Promise<any> {
        
        
        let raw_url = "";
        console.log(query);
        return new Promise((resolve, reject) => {
            request.get({
                url: 'http://localhost:5000/getentities/',
                qs: { sentence: query },
            }, (error, _response, body) => {
                if (error) {
                    //console.log(error);
                    reject(error);
                }
                else {
                    let body_obj = JSON.parse(body);
                    //console.log("returning body object");
                    resolve(body_obj);
                }
            });
        });
    }

   getEntitiesWithResponse(response) {
        let entitiesObject = {
            class: 'someclass',
            operation: 'someop',
            timePeriod: 'time',
            classLabel: 'label'
        };
                
       
       if (response) {
            entitiesObject.class = response.class || entitiesObject.class;
            entitiesObject.operation = response.operation || entitiesObject.operation;
            entitiesObject.timePeriod = response.time_period || entitiesObject.time;
        
        }

        //console.log(entitiesObject);
        return entitiesObject;
    }


    getEntities(query, languageCode, context, sessionId) {
        return new Promise((resolve, reject) => {
            this.call(query)
                .then((response) => {
                let result = response.result;
                
                let Entities = {
                    entities: this.getEntitiesWithResponse(response)
                };
                resolve(Entities);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
}
exports.default = SpacyEntityParserV1;
//# sourceMappingURL=DialogflowControllerV1.js.map