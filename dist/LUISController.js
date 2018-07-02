"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLUController_1 = require("./NLUController");
const request = require('request');
const querystring = require('querystring');
const config = require('../data/config.json');
class LUISController extends NLUController_1.default {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.endpoint = config.luis.endpoint;
        this.luisAppId = config.luis.appId;
        this.subscriptionKey = config.luis.subscriptionKey;
    }
    call(query) {
        // console.log(`LUISController: ${query}`);
        let endpoint = this.endpoint;
        let luisAppId = this.luisAppId;
        let queryParams = {
            "subscription-key": this.subscriptionKey,
            "timezoneOffset": "0",
            "verbose": true,
            "q": query
        };
        let luisRequest = endpoint + luisAppId + '?' + querystring.stringify(queryParams);
        return new Promise((resolve, reject) => {
            request(luisRequest, ((error, response, body) => {
                if (error) {
                    // console.log(error);
                    reject(error);
                }
                else {
                    // console.log(response, body);
                    let body_obj = JSON.parse(body);
                    resolve(body_obj);
                }
            }));
        });
    }
    getEntitiesWithResponse(response) {
        let entitiesObject = {
            user: 'Someone',
            userOriginal: 'Someone',
            thing: 'that',
            thingOriginal: 'that'
        };
        response.entities.forEach((entity) => {
            entitiesObject[`${entity.type}Original`] = entity.entity;
            if (entity.resolution && entity.resolution.values) {
                entitiesObject[`${entity.type}`] = entity.resolution.values[0];
            }
        });
        return entitiesObject;
    }
    getIntentAndEntities(query, languageCode, context, sessionId) {
        return new Promise((resolve, reject) => {
            this.call(query)
                .then((response) => {
                let intentAndEntities = {
                    intent: response.topScoringIntent.intent,
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
exports.default = LUISController;
//# sourceMappingURL=LUISController.js.map