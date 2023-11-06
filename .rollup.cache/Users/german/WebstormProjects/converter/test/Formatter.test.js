import { describe, it } from "node:test";
import { expect } from "chai";
import { Formatters } from "../src";
describe('Formatter', () => {
    it('should check if all formatters implement the Formatter interface', () => {
        for (const formatterClass of Object.values(Formatters)) {
            expect(formatterClass).to.have.property("format");
            expect(formatterClass.format).to.be.a("function");
            const sampleData = [];
            const result = formatterClass.format(sampleData);
            expect(result).to.be.instanceof(Promise);
        }
    });
});
//# sourceMappingURL=Formatter.test.js.map