"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DialogflowControllerV1_1 = require("./DialogflowControllerV1");

const SpacyEntityParser_1 = require("./SpacyEntityParser");


const Neo4jController_1 = require("./neo4j/Neo4jController");
const prettyjson = require('prettyjson');
class DialogManager {
    constructor(options = {}) {
        this.sessionId = `robot_${Math.floor(Math.random() * 10000)}`;
        this.languageCode = 'en-US';
        this._debug = false;
        console.log(`DialogManager: options:`, options);
        options.nluType = 'dialogFlow';
        if (options.debug) {
            this._debug = true;
        }
        /*  if (options.nluType === 'dialogflow') {
             this.nluController = new DialogflowControllerV2();
         } else if (options.nluType === 'dialogflowV1') {
             this.nluController = new DialogflowControllerV1();
         } else {
             this.nluController = new LUISController();
         } */
        this.nluController = new DialogflowControllerV1_1.default();
        console.log(this.nluController);
        this.neo4jController = new Neo4jController_1.default();

        this.spacyController = new SpacyEntityParser_1.default();
    }
    ask(question, context) {
        return new Promise((resolve, reject) => {
            this.nluController.getIntentAndEntities(question, this.languageCode, context, this.sessionId)
                .then((intentAndEntities) => {
                this.handleNLUIntentAndEntities(intentAndEntities)
                    .then((answer) => {
                    console.log(answer);
                    
                    resolve(answer);
                })
                    .catch((err) => {
                    console.log(err);
                    reject(err);
                });
            })
                .catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }
    handleNLUIntentAndEntities(intentAndEntities) {
        return new Promise((resolve, reject) => {
            let intent = intentAndEntities.intent;
            let entities = intentAndEntities.entities;

            /**
             * 
             * special override becase we want to trigger dependency parsing
             * only when we detect an intent of useranalytics - which is coming
             * from dialogflow
             * 
             */
            let question = intentAndEntities.question;
            let answer;
            this.debug(prettyjson.render(intentAndEntities, {}));
            if (intent == 'launchDoYouLike' || intent == 'Default Fallback Intent') {

                /**
                 * 
                 * we are using dialogflow for identifying the user intent and isolating likely
                 * intents that need to be futher analysed for user query. 
                 * 
                 * any other intents related to greeting or other regular commands can be handled easily that way
                 */


                console.log(`INTENT: launchDoYouLike`);
                let cypher = `match (a {name:'${entities.thing}'})<-[:LIKES]-(j:Robot {name:'global'}) return a`;
                this.debug(`  STEP 1a: SEE IF THE ROBOT LIKES THAT NODE ALREADY...`);
                this.debug(`    cypher: ${cypher}`);
                this.neo4jController.parseCypherWithD3Helper(cypher)
                    .then((data) => {
                    this.debug(`    cypher result:`, data);
                    if (data.nodes.length == 1) { // when successful, there will be one matching node as long as the entity names are unique
                        let node = data.nodes[0];
                        let scriptedResponse = node.properties['RobotLikes'];
                        answer = scriptedResponse ? scriptedResponse : `Yes, I do like ${entities.thingOriginal} very much.`;
                        cypher = `match ({name:'${entities.thing}'})<-[:LIKES]-(user:User) return user`;
                        this.debug(`  STEP 1a: SEE IF THERE IS A USER THAT ALSO LIKES THAT NODE...`);
                        this.debug(`    cypher: ${cypher}`);
                        this.neo4jController.parseCypherWithD3Helper(cypher)
                            .then((data) => {
                            this.debug(`    cypher result:`, data);
                            if (data.nodes.length > 0) {
                                answer += this.generateListWithPhrases(data.nodes, '...and I know that', 'likes them too.', 'like them too.');
                            }
                            resolve(answer);
                        })
                            .catch(() => {
                            reject();
                        });
                    }
                    else {
                        let cypher = `match(v {name:'${entities.thing}'})<-[:IS_A *]-(p)<-[l:LIKES]-(j:Robot {name:'global'}) return p`;
                        this.debug(`  STEP 2: SEE IF THE ARE DESCENDANTS OF THAT NODE LIKED BY THE ROBOT...`);
                        this.debug(`    cypher: ${cypher}`);
                        this.neo4jController.parseCypherWithD3Helper(cypher)
                            .then((data) => {
                            this.debug(`    cypher result:`, data);
                            let nodes = data.nodes;
                            if (nodes.length > 1) {
                                answer = `Yes I like many ${entities.thingOriginal} and in particular i love`;
                                answer += this.pluralList(nodes);
                                resolve(answer);
                            }
                            else if (nodes.length == 1) {
                                let node = nodes[0];
                                answer = `Yes, of all the ${entities.thingOriginal} i like ${this.getPluralNameWithNode(node)}.`;
                                resolve(answer);
                            }
                            else { // try upward inference
                                cypher = `match (a {name:'${entities.thing}'})-[:IS_A]->(b) with b match (b)<-[:IS_A *]-(p)<-[:LIKES]-(j:Robot {name:'global'}) return b, p`;
                                this.debug(`  STEP 3: TRY AN UPWARD REFERENCE...`);
                                this.debug(`    cypher: ${cypher}`);
                                this.neo4jController.parseCypherWithD3Helper(cypher)
                                    .then((data) => {
                                    this.debug(`    cypher result:`, data);
                                    answer = `Actually I don't know if I like ${entities.thingOriginal}.`;
                                    let nodes = data.nodes;
                                    if (nodes.length > 1) { // the first node will be the parent and its children will be other instances of that type
                                        let parentNode = nodes.shift();
                                        answer = `I don't know if I like ${entities.thingOriginal} but they are ${this.getPluralNameWithNode(parentNode)}`;
                                        answer = `${answer} and I do like ${this.getPluralNameWithNode(parentNode)}. Of all the ${this.getPluralNameWithNode(parentNode)}`;
                                        answer = `${answer} I like`;
                                        if (nodes.length > 1) {
                                            answer += this.pluralList(nodes);
                                        }
                                        else {
                                            answer = `${answer} ${this.getPluralNameWithNode(nodes[0])}.`;
                                        }
                                    }
                                    resolve(answer);
                                })
                                    .catch(() => {
                                    reject();
                                });
                            }
                        });
                    }
                })
                    .catch(() => {
                    reject();
                });
            }
            else if (intent == 'launchUserLikes') {
                let answer = `OK. I understand that ${entities.user} likes ${entities.thingOriginal}. That's cool!`;
                let cypher = `merge (user:User {name:'${entities.user}'})`;
                this.debug(`  STEP 1: CREATE USER NODE IF IT DOES NOT EXIST YET...`);
                this.debug(`    cypher: ${cypher}`);
                this.neo4jController.call(cypher)
                    .then((data) => {
                    // Make a LIKE relationship
                    cypher = `match (like {name:'${entities.thing}'}) with like match(user:User {name:'${entities.user}'}) with like, user merge (user)-[:LIKES]->(like)`;
                    this.debug(`  STEP 1a: CREATE A LIKE RELATIONSHIP...`);
                    this.debug(`    cypher: ${cypher}`);
                    this.neo4jController.call(cypher)
                        .then((data) => {
                        resolve(answer);
                    })
                        .catch(() => {
                        reject();
                    });
                })
                    .catch(() => {
                    reject();
                });
            }
            else if (intent == 'launchAnalytics') {

                /**
                 * 
                 * we have the intent and the entities based on training. in future versions we will decide whether to 
                 * ignore or keep or compare them. for now we will ignore and send the query to spacy 
                 */

                console.log("getting entities", question);

                    return new Promise((resolve, reject) => {
                        this.spacyController.getEntities(question)
                            .then((entities) => {

                                let answer = `OK. I understand that we need to perform an ${entities.operation} on ${entities.class} for  ${entities.timePeriod}. That's cool!`;
                                let cypher = `MATCH p=()-[r:HAS_OPPORTUNITY]->() RETURN p LIMIT 25`;
                                this.debug(answer);
                                this.debug(`    cypher: ${cypher}`);
                                this.neo4jController.call(cypher)
                                .then((data) => {
                                    // Make a LIKE relationship
                                    //cypher = `match (like {name:'${entities.thing}'}) with like match(user:User {name:'${entities.user}'}) with like, user merge (user)-[:LIKES]->(like)`;
                                    //this.debug(`  STEP 1a: CREATE A LIKE RELATIONSHIP...`)
                                // this.debug(`    cypher: ${cypher}`);
                                // this.neo4jController.call(cypher)
                                // .then((data: any) => {
                                      
                                        resolve(data);
                                // })
                                // .catch(() => {
                                    //   reject();
                                // });
                                })
                                .catch(() => {
                                    reject();
                                }); 
                            
                        })
                            .catch((err) => {
                            console.log(err);
                            reject(err);
                        });
                    });

            }
            else {
                reject();
            }
        });
    }
    getPluralNameWithNode(node) {
        let result = `${node.properties.name}s`;
        if (node.properties.plural) {
            result = node.properties.plural;
        }
        return result;
    }
    pluralList(nodes) {
        let result = '';
        for (let i = 0; i < (nodes.length - 1); i++) {
            let node = nodes[i];
            result += ` ${this.getPluralNameWithNode(node)}`;
            if (nodes.length > 2) {
                result += ',';
            }
        }
        ;
        result += ` and ${this.getPluralNameWithNode(nodes[nodes.length - 1])}.`;
        return result;
    }
    generateListWithPhrases(nodes, introPhrase = '', singularPhrase = '', pluralPhrase = '') {
        let result = '';
        if (nodes.length > 0) {
            result += introPhrase;
            if (nodes.length == 1) {
                result += ` ${nodes[0].properties['name']} ${singularPhrase}`;
            }
            else {
                for (let i = 0; i < (nodes.length - 1); i++) {
                    let node = nodes[i];
                    result += ` ${node.properties['name']}`;
                    if (nodes.length > 2) {
                        result += ',';
                    }
                }
                ;
                result += ` and ${nodes[nodes.length - 1].properties['name']}`;
                result += ` ${pluralPhrase}`;
            }
        }
        return result;
    }
    deleteUsers() {
        return new Promise((resolve, reject) => {
            let cypher = `match (n:User)-[r:LIKES]->() delete n, r`;
            this.neo4jController.call(cypher)
                .then(() => {
                this.debug(`The User nodes have been deleted.`);
                resolve();
            });
        });
    }
    debug(text, object) {
        if (this._debug) {
            if (text && object) {
                console.log(text, object);
            }
            else {
                console.log(text);
            }
        }
    }
}
exports.default = DialogManager;
//# sourceMappingURL=DialogManager.js.map