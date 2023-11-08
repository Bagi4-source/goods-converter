import {Product} from "../src/types";
import { expect, describe, it} from 'vitest'
import {Formatters} from "../src";


describe('Formatter', () => {
    it('should check if all formatters implement the Formatter interface', () => {
        for (const formatterClass of Object.values(Formatters)) {

            expect(formatterClass).to.have.property("format");
            expect(formatterClass.format).to.be.a("function");

            const sampleData: Product[] = [];
            const result = formatterClass.format(sampleData);
            expect(result).to.be.instanceof(Promise);
        }
    });
});
