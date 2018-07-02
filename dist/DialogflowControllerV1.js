"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLUController_1 = require("./NLUController");
const request = require('request');
const config = require('../data/config.json');
class DialogflowControllerV1 extends NLUController_1.default {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.apiAuthorization = `Bearer ${config.dialogflow.clientToken}`;
    }
    // let latitude: string = '42.361145';
    // let longitude: string = '-71.057083';
    // let timezone: string = 'America/New_York';
    call(query, languageCode, context, sessionId) {
        // call(query:string, latitude:string, longitude:string, sessionId:string, iana_timezone:string, contexts: string[]): Promise<any> {
        let data = {
            "query": query,
            "lang": "en",
            "sessionId": sessionId,
            "location": {
                "latitude": Number('42.361145'),
                "longitude": Number('-71.057083'),
            },
            "timezone": 'America/New_York'
        };
        if (context) {
            data.contexts = [context];
        }
        let raw_url = "";
        return new Promise((resolve, reject) => {
            request.post({
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": `${this.apiAuthorization}`
                },
                url: 'https://api.api.ai/v1/query?v=20150910',
                body: JSON.stringify(data)
            }, (error, response, body) => {
                if (error) {
                    //console.log(error);
                    reject(error);
                }
                else {
                    let body_obj = JSON.parse(body);
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
        let result = response.result;
        let parameters;
        if (result && result.contexts && result.contexts[0]) {
            parameters = result.contexts[0].parameters;
            if (parameters) {
                entitiesObject.class = parameters['class'] || entitiesObject.class;
                entitiesObject.operation = parameters['operation'] || entitiesObject.operation;
                entitiesObject.timePeriod = parameters['time-period'] || entitiesObject.time;
                entitiesObject.classLabel = parameters['class-label'] || entitiesObject.classLabel;
            }
        }
        else if (result && result.parameters) {
            entitiesObject.class = result.parameters['class'] || entitiesObject.class;
            entitiesObject.operation = result.parameters['operation'] || entitiesObject.operation;
            entitiesObject.timePeriod = result.parameters['time-period'] || entitiesObject.time;
            entitiesObject.classLabel = result.parameters['class-label'] || entitiesObject.classLabel;
            // entitiesObject.thing = result.parameters['thing'] || entitiesObject.thing;
            // entitiesObject.thingOriginal = result.parameters['thing'] || entitiesObject.thingOriginal;
        }
        return entitiesObject;
    }
    getIntentAndEntities(query, languageCode, context, sessionId) {
        return new Promise((resolve, reject) => {
            this.call(query, languageCode, context, sessionId)
                .then((response) => {
                
                let result = response.result;
                let metadata = result.metadata;
                let intent = metadata.intentName;
                //  console.log(intent);
                //  console.log(response);
                let intentAndEntities = {
                    question: query,
                    intent: intent,
                    entities: this.getEntitiesWithResponse(response)
                };
                resolve(intentAndEntities);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
}
exports.default = DialogflowControllerV1;
//# sourceMappingURL=DialogflowControllerV1.js.map