"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j = require('neo4j-driver').v1;
class BoltToD3 {
    constructor() {
    }
    isLink(field) {
        return field.start && field.end;
    }
    isNode(field) {
        return !this.isLink(field);
    }
    parse(boltResponse) {
        let i;
        this.nodeDict = {};
        this.nodes = [];
        this.relationships = [];
        for (i = 0; i < boltResponse.records.length; i++) {
            // console.log(`Parsing node ${i}`);
            this.parseFields(boltResponse.records[i]._fields);
        }
        return {
            nodes: this.nodes,
            links: this.relationships
        };
    }
    ;
    // {
    //     "id": "3",
    //     "labels": ["Address"],
    //     "properties": {
    //         "zipCode": "90210",
    //         "country": "US",
    //         "city": "Beverly Hills",
    //         "state": "CA"
    //     }
    // }
    makeNode(field) {
        let id = this.getId(field);
        // console.log(`makeNode: ${id}`, field);
        let props = this.convertNumberProps(field.properties);
        if (!this.nodeDict[id]) {
            this.nodes.push({
                id: `${id}`,
                labels: field.labels,
                properties: props,
                group: 1
            });
            this.nodeDict[id] = true;
        }
        return id;
    }
    ;
    // {
    //     "id": "13",
    //     "type": "HAS_EMAIL",
    //     "startNode": "1",
    //     "endNode": "14",
    //     "properties": {},
    //     "source": "1",
    //     "target": "14",
    //     "linknum": 1
    // }
    makeLink(field, id1, id2) {
        let id = this.getId(field);
        let props = this.convertNumberProps(field.properties);
        this.relationships.push({
            id: `${id}`,
            type: field.type,
            startNode: `${id1}`,
            endNode: `${id2}`,
            properties: props,
            source: `${id1}`,
            target: `${id2}`,
            value: 1,
            linknum: 1
        });
    }
    ;
    convertNumberProps(props) {
        for (let key in props) {
            let prop = props[key];
            if (neo4j.isInt(prop)) {
                props[key] = {
                    raw: prop,
                    converted: this.convertInt(prop)
                };
            }
        }
        return props;
    }
    ;
    convertInt(neoInt) {
        return neo4j.integer.inSafeRange(neoInt) ? neo4j.integer.toNumber(neoInt) : neoInt;
    }
    ;
    getId(field) {
        return this.convertInt(field.identity);
    }
    ;
    // Beware: IDs/identities in neo4j are unique to their type (so a node and link could have the same ID)
    parseFields(fields) {
        // console.log(`parseFields: `, fields);
        let neoIdDict = {};
        // first we parse the nodes
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            let id = this.getId(field);
            let neoId = (this.isNode(field) ? 'node' : 'link') + field.identity.toString();
            neoIdDict[neoId] = this.isNode(field) ? this.makeNode(field) : field;
        }
        // console.log(neoIdDict);
        // now we have valid node IDs and a dictionary, we can parse the links
        for (let key in neoIdDict) {
            let field = neoIdDict[key];
            if (this.isLink(field)) {
                let start = this.convertInt(field.start);
                let end = this.convertInt(field.end);
                this.makeLink(field, start, end);
            }
        }
    }
}
exports.default = BoltToD3;
//# sourceMappingURL=BoltToD3.js.map