"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LUISController_1 = require("./LUISController");
const program = require('commander');
const prettyjson = require('prettyjson');
let luisController = new LUISController_1.default();
program
    .version('0.0.1')
    .description('An application for testing LUIS requests')
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
luisController.call(query)
    .then((result) => {
    console.log(prettyjson.render(result, {}));
})
    .catch((err) => {
    console.log(`ERROR: LUISController\n`, err);
});
//# sourceMappingURL=testLUISController.js.map