import {GoodsExporter, Formatters, Transformer} from "../src";
import {describe, expect, it} from 'vitest'
import * as fs from "fs";
import {categories, products} from "./constants";

describe('GoodsExporter', () => {
    const exporter = new GoodsExporter();
    const formatter = Formatters.YML;

    it('check export', async () => {
        const data = await exporter.export<Buffer>(products, categories);
        expect(data).toMatchSnapshot()
    });

    it('check export with transformers', async () => {
        const transformers: Record<string, Transformer> = {
            PRICE: (product) => ({
                ...product,
                price: product.price + 10000
            }),
            IMAGE: (product) => ({
                ...product,
                images: product.images?.map(image => image.replace("image", "pic"))
            })
        }

        const keys = ["PRICE", "IMAGE"];


        exporter.setFormatter(formatter);
        exporter.setTransformers(keys.map(key => transformers[key]));


        exporter.setExporter((data: Buffer) => {
            return data;
        });

        const data = await exporter.export<Buffer>(products, categories);

        expect(data).toMatchSnapshot();
    });

});
