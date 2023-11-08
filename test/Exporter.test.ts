import {GoodsExporter, Formatters, Transformer, Category, Currency, Product, Vat} from "../src";
import {describe, expect, it} from 'vitest'
import * as fs from "fs";


describe('GoodsExporter', () => {
    const exporter = new GoodsExporter();
    const products: Product[] = [
        {
            productId: 1,
            parentId: 0,
            variantId: 1111,
            currency: Currency.RUR,
            title: "Title",
            description: "Description",
            vendor: "Nike",
            vendorCode: "NIKE-1111",
            categoryId: 1,
            countryOfOrigin: "Китай",
            images: ["image1", "image2"],
            price: 19000,
            oldPrice: 20000,
            additionalExpenses: 1000,
            purchasePrice: 15000,
            available: true,
            barcode: "567890567893",
            weight: 0.15,
            dimensions: "12/32/43",
            vat: Vat.VAT_20,
            count: 24,
            params: [{
                key: "p1",
                value: "v1"
            }, {
                key: "p2",
                value: "v2"
            }],
            age: {
                unit: "year",
                value: 6
            },
            tags: ["Nike", "Кроссовки"],
            adult: false
        }
    ];
    const categories: Category[] = [
        {id: 1, parentId: 2, name: "Обувь"},
        {id: 2, parentId: 3, name: "Одежда, обувь и аксессуары"},
        {id: 3, name: "Все товары"},
    ];

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

        const keys = ["PRICE", "IMAGE"]

        exporter.setFormatter(Formatters.YML);
        exporter.setTransformers(keys.map(key => transformers[key]));
        exporter.setExporter((data: Buffer) => {
            fs.writeFileSync("output.yml", data)
            return data
        });

        const data = await exporter.export<Buffer>(products, categories);
        const expectedResult = fs.readFileSync("output.yml");

        expect(data).toStrictEqual(expectedResult);
    });
});
