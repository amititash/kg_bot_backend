"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DialogflowController = require("./DialogflowControllerV1");
const program = require('commander');
const prettyjson = require('prettyjson');
let dialogflowControllerV1 = new DialogflowController();
//let dialogflowControllerV2 = new DialogflowControllerV2_1.default();
program
    .version('0.0.1')
    .description('An application for testing dialogflow requests')
    .option('-q, --query <query>', 'The query to test')
    .option('-c, --context <context>')
    .parse(process.argv);
let query = 'do you like penguins';
let languageCode = 'en-US';
let context = undefined;
let contexts = undefined;
if (program.query) {
    console.log(program.query);
    query = program.query;
}
if (program.context) {
    console.log(program.context);
    context = program.context;
    contexts = [program.context];
}
let sessionId = `${Math.floor(Math.random() * 10000)}`;
// V1
let latitude = '42.361145';
let longitude = '-71.057083';
let timezone = 'America/New_York';

latitude = program.lat ? program.lat : latitude;
longitude = program.long ? program.long : longitude;
sessionId = program.robot ? program.robot : sessionId;
timezone = program.tz ? program.tz : timezone;
dialogflowControllerV1.call(query, latitude, longitude, sessionId, timezone, contexts)
    .then((response) => {
        console.log(prettyjson.render(response, {}));
    })
    .catch((err) => {
        console.log(`ERROR: dialogflowController\n`, err)
    });
// V2
/* dialogflowControllerV2.call(query, languageCode, context, sessionId)
    .then((result) => {
    console.log(prettyjson.render(result, {}));
})
    .catch((err) => {
    console.log(`ERROR: dialogflowController\n`, err);
}); */
//# sourceMappingURL=testDialogflowController.js.map