import {type Formatter, Formatters, FormatterTypes, IProduct} from "../src/types";
import {describe, it} from "node:test";
import {expect} from "chai";


describe('Formatter Interface', () => {
    it('should check if all formatters implement the Formatter interface', () => {
        for (const formatterType of Object.values(FormatterTypes)) {
            const formatterClass = Formatters[formatterType];

            expect(formatterClass).to.have.property("export");
            expect(formatterClass.export).to.be.a("function");

            const sampleData: IProduct[] = [];
            const result = formatterClass.export(sampleData);
            expect(result).to.be.instanceof(Promise);
        }
    });
});
