import {expect, describe, it} from 'vitest'
import {Formatters} from "../src";
import {categories, products} from "./constants";


describe('CSVConverter', () => {
    const formatter = Formatters.CSV;


    it('should export CSV data', async () => {
        const resultSplit = await formatter.format(products, categories, {splitParams: true});
        expect(resultSplit).toMatchSnapshot();

        const result = await formatter.format(products, categories);
        expect(result).toMatchSnapshot();
    });
});
