"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DialogManager_1 = require("./DialogManager");
const program = require('commander');
program
    .version('0.0.1')
    .description('An application for testing the DialogManager class')
    .option('-q, --query <query>', 'The query to test')
    .option('-c, --context <context>')
    .option('-n, --nlu <nlu>', 'luis, dialogflow, dialogflowV1')
    .parse(process.argv);
let context = 'launch';
let contexts = [context];
let query = 'do you like penguins';
let nluType = 'luis';
if (program.context) {
    contexts = [program.context];
}
if (program.query) {
    // console.log(program.query);
    query = program.query;
}
if (program.nlu) {
    nluType = program.nlu;
}
const dialogManager = new DialogManager_1.default({ debug: true, nluType: nluType });
dialogManager.ask(query, context)
    .then((result) => {
    console.log(`result:\n`, result);
})
    .catch((err) => {
    console.log(`error:\n`, err);
});
//# sourceMappingURL=testDialogManager.js.map