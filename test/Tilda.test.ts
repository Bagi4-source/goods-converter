import {Formatters} from "../src";
import {expect, describe, it} from 'vitest'
import {categories, products} from "./constants";

describe('TildaConverter', () => {
    const formatter = Formatters.Tilda;

    it('should export Tilda csv data', async () => {
        const result = await formatter.format(products, categories);
        expect(result).toMatchSnapshot();
    });
});
