"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j = require('neo4j-driver').v1;
const config = require('../../data/config.json');
const D3Helper_1 = require("./helpers/D3Helper");
class Neo4jController {
    constructor() {
        this.driver = neo4j.driver(config.neo4j.url, neo4j.auth.basic(config.neo4j.user, config.neo4j.password));
    }
    call(cypher, params) {
        return new Promise((resolve, reject) => {
            let session = this.driver.session();
            session.run(cypher, params)
                .then(function (result) {
                session.close();
                resolve(result);
            })
                .catch(function (error) {
                reject(error);
            });
        });
    }
    parseCypherWithD3Helper(cypher, params) {
        return new Promise((resolve, reject) => {
            this.call(cypher, params)
                .then(response => {
                resolve(D3Helper_1.default.data(response));
            })
                .catch(error => {
                reject(error);
            });
        });
    }
    getNodesWithPropertyAndValue(property, value) {
        return new Promise((resolve, reject) => {
            let cypher = `
                MATCH (n {${property}: "${value}"})-[r]-(p)
                return n,r,p
            `;
            this.call(cypher)
                .then(response => {
                resolve(D3Helper_1.default.data(response));
            })
                .catch(error => {
                reject(error);
            });
        });
    }
    updateNodeWithIdAndProperties(id, properties) {
        return new Promise((resolve, reject) => {
            let cypher = `
                match (n) WHERE ID(n) = ${id}
                set n = { props }
            `;
            this.call(cypher, { props: properties })
                .then(response => {
                resolve(D3Helper_1.default.data(response));
            })
                .catch(error => {
                reject(error);
            });
        });
    }
    test() {
        this.call('MATCH (n) return n LIMIT 10')
            .then(result => {
            console.log(result);
        })
            .catch(error => {
            console.log(error);
        });
    }
}
exports.default = Neo4jController;
//# sourceMappingURL=Neo4jController.js.map