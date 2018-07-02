"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BoltToD3_1 = require("./BoltToD3");
class PartnersGraphHelper {
    static data(cypherResponse) {
        let result = {};
        // console.log(cypherResponse);
        let parser = new BoltToD3_1.default();
        result = parser.parse(cypherResponse);
        return result;
    }
}
exports.default = PartnersGraphHelper;
//# sourceMappingURL=D3Helper.js.map