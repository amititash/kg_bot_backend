"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j_1 = require("./neo4j");
const program = require('commander');
const prettyjson = require('prettyjson');
let neo4jController = new neo4j_1.default();
program
    .version('0.0.1')
    .description('An application testing neo4j cyphers')
    .option('-c, --cypher <cypher>', 'Specify the cypher to test')
    .option('--d3', 'Parse results with D3Helper')
    .parse(process.argv);
let cypher = 'match (n) return n LIMIT 25';
if (program.cypher) {
    console.log(program.cypher);
    cypher = program.cypher;
}
let d3HelperFlag = false;
if (program.d3) {
    console.log(program.d3);
    d3HelperFlag = true;
}
if (d3HelperFlag) {
    neo4jController.parseCypherWithD3Helper(cypher)
        .then((response) => {
        let output = prettyjson.render(response, {});
        console.log(output);
    })
        .catch((err) => {
        console.log(`ERROR: neo4jController\n`, err);
    });
}
else {
    neo4jController.call(cypher)
        .then((response) => {
        let output = prettyjson.render(response, {});
        console.log(output);
    })
        .catch((err) => {
        console.log(`ERROR: neo4jController\n`, err);
    });
}
//# sourceMappingURL=testNeo4jController.js.map