"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require('commander');
const inquirer = require('inquirer');
const Rx = require('rx');
const prettyjson = require('prettyjson');
const DialogManager_1 = require("./DialogManager");
let dialogManager;
program
    .version('0.0.1')
    .description('An application testing dialog interactions')
    .option('-d, --debug', 'Turn on debug messages')
    .option('-c, --context <context>')
    .option('-r, --reset', 'Reset the loop')
    .parse(process.argv);
let context = 'launch';
let contexts = [context];
if (program.debug) {
    dialogManager = new DialogManager_1.default({ debug: true });
}
else {
    dialogManager = new DialogManager_1.default({ debug: false });
}
if (program.context) {
    context = program.context;
    contexts = [program.context];
}
if (program.reset) {
    console.log('>>>Cleaning up loop nodes');
    let cleanLoop_Cypher = 'match (n:LoopMember)-[r:LIKES]->() delete n, r';
    dialogManager.deleteUsers();
}
var questions = [
    {
        type: 'input',
        name: 'query',
        message: 'Enter a query: ',
        default: 'match (n) return n'
    }
];
const prompts = new Rx.Subject();
let i = 0;
function makePrompt(msg) {
    let prompt = '';
    return {
        type: 'input',
        name: `userInput-${i}`,
        message: `${msg || 'Ask a do-you-like question or say "[user] likes [something]".'}\n`,
    };
}
inquirer.prompt(prompts).ui.process.subscribe((result) => {
    console.log("here");
    if (result && result.answer !== '') {
        i += 1;
        console.log(result);
        dialogManager.ask(result.answer, context)
            .then((result) => {
            prompts.onNext(makePrompt(result));
        })
            .catch(() => {
            prompts.onNext(makePrompt('Please try that again.'));
        });
    }
    else {
        prompts.onCompleted();
    }
}, (err) => {
    console.warn(err);
}, () => {
    console.log('Interactive session is complete. Good bye! 👋\n');
});
prompts.onNext(makePrompt(''));
//# sourceMappingURL=index.js.map